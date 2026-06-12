import 'dotenv/config';
import { faker } from '@faker-js/faker/locale/vi';
import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const prisma = new PrismaClient({
    adapter: new PrismaPg({
        connectionString: process.env.DATABASE_URL,
    }),
});

const PRODUCTS = [
    { name: 'Áo thun basic unisex cotton', keyword: 'tshirt fashion' },
    { name: 'Quần jean slim fit nam', keyword: 'blue jeans fashion' },
    { name: 'Váy midi hoa nhí vintage', keyword: 'vintage dress' },
    { name: 'Áo khoác dù chống nước', keyword: 'jacket fashion' },
    { name: 'Giày sneaker cổ thấp', keyword: 'white sneakers' },
    { name: 'Túi tote canvas in hình', keyword: 'tote bag' },
    { name: 'Ốp lưng điện thoại silicon', keyword: 'phone case' },
    { name: 'Tai nghe bluetooth không dây', keyword: 'wireless headphones' },
    { name: 'Bình giữ nhiệt 500ml inox', keyword: 'thermos bottle' },
    { name: 'Đèn bàn LED học sinh', keyword: 'desk lamp' },
    { name: 'Gối ôm bông nhân tạo', keyword: 'pillow' },
    { name: 'Sách kỹ năng tư duy tích cực', keyword: 'book' },
    { name: 'Bộ dụng cụ nhà bếp inox', keyword: 'kitchen tools' },
    { name: 'Máy sấy tóc mini du lịch', keyword: 'hair dryer' },
    { name: 'Chuột gaming không dây RGB', keyword: 'gaming mouse' },
    { name: 'Bàn phím cơ compact 75%', keyword: 'mechanical keyboard' },
    { name: 'Đồng hồ thông minh thể thao', keyword: 'smartwatch' },
    { name: 'Ba lô laptop chống thấm', keyword: 'laptop backpack' },
    { name: 'Kem dưỡng da mặt SPF50', keyword: 'skincare product' },
    { name: 'Son môi lì lâu trôi', keyword: 'lipstick makeup' },
];

type UnsplashResponse = {
    results: {
        urls: {
            regular: string;
        };
    }[];
};

const imageCache = new Map<string, string[]>();

async function getUnsplashImages(
    keyword: string,
): Promise<string[]> {
    if (imageCache.has(keyword)) {
        return imageCache.get(keyword)!;
    }

    const params = new URLSearchParams({
        query: keyword,
        per_page: '10',
        orientation: 'squarish',
    });

    const res = await fetch(
        `https://api.unsplash.com/search/photos?${params}`,
        {
            headers: {
                Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}`,
            },
        },
    );

    if (!res.ok) {
        throw new Error(
            `Unsplash error: ${res.status} ${res.statusText}`,
        );
    }

    const data = (await res.json()) as UnsplashResponse;

    const images = data.results.map(
        (item) => item.urls.regular,
    );

    imageCache.set(keyword, images);

    return images;
}

async function main() {
    const shops = await prisma.shop.findMany({
        select: {
            id: true,
        },
    });

    const categories = await prisma.category.findMany({
        select: {
            id: true,
        },
    });

    if (!shops.length) {
        throw new Error('Chưa có shop nào trong database');
    }

    let count = 0;

    for (let i = 0; i < 50; i++) {
        const template = PRODUCTS[i % PRODUCTS.length];

        const shopId =
            shops[Math.floor(Math.random() * shops.length)].id;

        const categoryId = categories.length
            ? categories[
                Math.floor(Math.random() * categories.length)
            ].id
            : null;

        const price = faker.number.int({
            min: 29000,
            max: 1490000,
        });

        const hasSale = faker.datatype.boolean({
            probability: 0.4,
        });

        const salePrice = hasSale
            ? faker.number.int({
                min: 10000,
                max: price - 5000,
            })
            : null;

        const rating = faker.number.float({
            min: 3.5,
            max: 5,
            fractionDigits: 1,
        });

        const reviewCount = faker.number.int({
            min: 0,
            max: 3000,
        });

        const product = await prisma.product.create({
            data: {
                shopId,
                categoryId,
                name: `${template.name} - ${faker.commerce.productAdjective()}`,
                description: faker.commerce.productDescription(),
                price: price.toString(),
                salePrice: salePrice?.toString() || null,
                stock: faker.number.int({
                    min: 5,
                    max: 500,
                }),
                soldCount: faker.number.int({
                    min: 0,
                    max: 5000,
                }),
                rating,
                reviewCount,
                status: 'active',
            },
        });

        const images = await getUnsplashImages(
            template.keyword,
        );

        const selectedImages = faker.helpers.arrayElements(
            images,
            3,
        );

        await prisma.productImage.createMany({
            data: selectedImages.map((img, index) => ({
                productId: product.id,
                imagePath: img,
                isMain: index === 0,
            })),
        });

        count++;

        console.log(`✅ Created product ${count}`);
    }

    console.log(`🎉 Done! Created ${count} products`);
}

main()
    .catch((err) => {
        console.error(err);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });