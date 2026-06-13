import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const reviews5 = [
    "Giao hàng cực kỳ nhanh, đóng gói cẩn thận. Sản phẩm rất đẹp và đúng mô tả!",
    "Chất lượng tuyệt vời, vải mềm mịn mặc rất thích. Shop phục vụ rất chu đáo.",
    "Sản phẩm dùng tốt lắm mọi người nên mua nhé. 10 điểm cho chất lượng!",
    "Đóng gói đẹp, sản phẩm chất lượng cao. Sẽ ủng hộ shop nhiều lần nữa.",
    "Mua lần thứ 2 rồi vẫn rất hài lòng. Giao hàng nhanh, đóng gói kỹ.",
    "Sản phẩm rất tốt, giao hàng nhanh, đúng hẹn, chất lượng tuyệt vời.",
    "Rất đáng tiền, đóng gói rất cẩn thận, sản phẩm giống hình ảnh mô tả."
];

const reviews4 = [
    "Sản phẩm chất lượng tốt, giao hàng hơi lâu một chút nhưng chấp nhận được.",
    "Hàng đẹp như hình, đóng gói tạm ổn. Giá cả phải chăng.",
    "Sản phẩm oke nha, dùng ổn áp trong tầm giá. Sẽ tiếp tục theo dõi shop.",
    "Đồ đẹp, nhưng size hơi rộng một xíu. Nói chung là vẫn hài lòng.",
    "Shop hỗ trợ nhiệt tình, sản phẩm dùng tốt, tuy nhiên hộp hơi móp."
];

const reviews3 = [
    "Chất lượng trung bình, phù hợp với túi tiền.",
    "Giao hàng hơi chậm, đóng gói sản phẩm chưa được cẩn thận lắm.",
    "Sản phẩm tạm ổn nhưng không được như kỳ vọng.",
    "Sản phẩm dùng bình thường, không có gì quá nổi bật."
];

const reviews2 = [
    "Sản phẩm không giống hình, chất lượng kém quá.",
    "Giao sai mẫu, liên hệ shop hỗ trợ hơi chậm.",
    "Chất lượng sản phẩm không tốt, đóng gói sơ sài.",
    "Sản phẩm dùng chán lắm, không giống quảng cáo."
];

const reviews1 = [
    "Quá tệ, sản phẩm lỗi hỏng hóc mà shop không chịu đổi trả.",
    "Giao hàng rất chậm, chất lượng kém, phí tiền mua.",
    "Trải nghiệm tệ hại, sản phẩm kém chất lượng, khuyên mọi người không nên mua."
];

const statuses = ['delivered', 'delivered', 'delivered', 'delivered', 'delivered', 'cancelled', 'shipping', 'confirmed', 'pending'];
const addressList = [
    '123 Nguyễn Trãi, Thanh Xuân, Hà Nội',
    '456 Lê Lợi, Hải Châu, Đà Nẵng',
    '789 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh',
    '101 Trần Hưng Đạo, Ninh Kiều, Cần Thơ',
    '202 Lê Hồng Phong, Ngô Quyền, Hải Phòng'
];
const names = ['Nguyễn Văn A', 'Trần Thị B', 'Lê Hoàng C', 'Phạm Minh D', 'Hoàng Anh E', 'Vũ Quốc F', 'Bùi Thị G'];

async function main() {
    console.log("🧹 Cleaning up old orders, reviews, and balances...");
    await prisma.withdrawalRequest.deleteMany();
    await prisma.returnRequest.deleteMany();
    await prisma.review.deleteMany();
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.shopBalance.deleteMany();
    console.log("✅ Cleanup complete.");

    // Fetch shops and products
    const shops = await prisma.shop.findMany({
        where: { products: { some: {} } },
        include: { products: { include: { images: true } } }
    });

    // Fetch all users
    const users = await prisma.user.findMany();
    const buyers = users.filter(u => u.role === 'user' || u.role === 'seller');

    if (shops.length === 0) {
        console.error("❌ No shops with products found in DB!");
        return;
    }

    if (buyers.length === 0) {
        console.error("❌ No buyers (users or sellers) found in DB!");
        return;
    }

    console.log(`🏪 Found ${shops.length} shops with products.`);
    console.log(`👤 Found ${buyers.length} buyers to use.`);

    const now = new Date();
    let orderCount = 0;
    let reviewCount = 0;

    // Get commission rate
    const config = await prisma.systemConfig.findUnique({
        where: { key: 'commission_rate' },
    });
    const commissionRate = config ? parseFloat(config.value) / 100 : 0.05;
    console.log(`💼 System Commission Rate: ${commissionRate * 100}%`);

    console.log("🌱 Generating fake orders and reviews for the past 30 days...");

    for (let i = 30; i >= 0; i--) {
        const orderDate = new Date();
        orderDate.setDate(orderDate.getDate() - i);

        // Generate 2 to 4 orders per day across the marketplace
        const dailyCount = Math.floor(Math.random() * 3) + 2;

        for (let j = 0; j < dailyCount; j++) {
            const shop = shops[Math.floor(Math.random() * shops.length)];
            const buyer = buyers[Math.floor(Math.random() * buyers.length)];

            // Avoid shop owner purchasing from their own shop
            let finalBuyer = buyer;
            if (buyer.id === shop.userId) {
                const otherBuyers = buyers.filter(b => b.id !== shop.userId);
                if (otherBuyers.length > 0) {
                    finalBuyer = otherBuyers[Math.floor(Math.random() * otherBuyers.length)];
                }
            }

            const product = shop.products[Math.floor(Math.random() * shop.products.length)];
            const quantity = Math.floor(Math.random() * 3) + 1; // 1 to 3 items
            const price = Number(product.price);
            const subtotal = price * quantity;
            const shippingFee = 30000;
            const total = subtotal + shippingFee;

            const status = statuses[Math.floor(Math.random() * statuses.length)];
            const isDelivered = status === 'delivered';

            let paymentStatus = 'pending';
            if (isDelivered) {
                paymentStatus = 'paid';
            } else if (status === 'cancelled') {
                paymentStatus = Math.random() > 0.5 ? 'failed' : 'pending';
            } else if (status === 'shipping' || status === 'confirmed') {
                paymentStatus = Math.random() > 0.4 ? 'paid' : 'pending';
            }

            const orderTime = new Date(orderDate);
            orderTime.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60));

            let settlementAt: Date | null = null;
            let isSettled = false;
            let commission = 0;

            if (isDelivered) {
                settlementAt = new Date(orderTime);
                settlementAt.setDate(settlementAt.getDate() + 3);

                if (settlementAt <= now) {
                    isSettled = true;
                    commission = Math.round(total * commissionRate);
                }
            }

            const mainImage = product.images?.find((img) => img.isMain)?.imagePath || product.images?.[0]?.imagePath || '';

            // Create Order and OrderItem in one transaction
            const order = await prisma.order.create({
                data: {
                    userId: finalBuyer.id,
                    shopId: shop.id,
                    subtotal,
                    shippingFee,
                    discount: 0,
                    total,
                    shippingAddress: addressList[Math.floor(Math.random() * addressList.length)],
                    receiverName: finalBuyer.name || names[Math.floor(Math.random() * names.length)],
                    receiverPhone: finalBuyer.phone || '0987654321',
                    paymentMethod: isDelivered || paymentStatus === 'paid' ? (Math.random() > 0.5 ? 'banking' : 'momo') : 'cod',
                    paymentStatus: paymentStatus as any,
                    shippingMethod: 'standard',
                    status: status as any,
                    createdAt: orderTime,
                    updatedAt: orderTime,
                    settlementAt,
                    isSettled,
                    commission,
                    items: {
                        create: {
                            productId: product.id,
                            productName: product.name,
                            productImage: mainImage,
                            quantity,
                            price,
                        }
                    }
                }
            });

            orderCount++;

            // Create comment/review for delivered orders (80% probability)
            if (isDelivered && Math.random() < 0.8) {
                const rand = Math.random();
                let rating = 5;
                let commentPool = reviews5;

                if (rand < 0.65) {
                    rating = 5;
                    commentPool = reviews5;
                } else if (rand < 0.85) {
                    rating = 4;
                    commentPool = reviews4;
                } else if (rand < 0.95) {
                    rating = 3;
                    commentPool = reviews3;
                } else if (rand < 0.98) {
                    rating = 2;
                    commentPool = reviews2;
                } else {
                    rating = 1;
                    commentPool = reviews1;
                }

                const comment = commentPool[Math.floor(Math.random() * commentPool.length)];
                const reviewTime = new Date(orderTime);
                reviewTime.setDate(reviewTime.getDate() + 3);
                reviewTime.setHours(reviewTime.getHours() + Math.floor(Math.random() * 12));

                await prisma.review.create({
                    data: {
                        userId: finalBuyer.id,
                        productId: product.id,
                        orderId: order.id,
                        rating,
                        comment,
                        createdAt: reviewTime > now ? now : reviewTime,
                        updatedAt: reviewTime > now ? now : reviewTime,
                    }
                });

                reviewCount++;
            }
        }
    }

    console.log(`🎉 Seeding phase 1 done: Created ${orderCount} orders and ${reviewCount} reviews.`);

    // Update Product aggregates
    console.log("📦 Calculating product aggregates (soldCount, reviewCount, rating)...");
    const products = await prisma.product.findMany();
    for (const prod of products) {
        const orderItems = await prisma.orderItem.findMany({
            where: {
                productId: prod.id,
                order: {
                    status: 'delivered'
                }
            }
        });
        const soldCount = orderItems.reduce((acc, item) => acc + item.quantity, 0);

        const productReviews = await prisma.review.findMany({
            where: { productId: prod.id }
        });
        const reviewCount = productReviews.length;
        const avgRating = reviewCount > 0 
            ? (productReviews.reduce((acc, rev) => acc + rev.rating, 0) / reviewCount)
            : 0;

        await prisma.product.update({
            where: { id: prod.id },
            data: {
                soldCount,
                reviewCount,
                rating: parseFloat(avgRating.toFixed(2))
            }
        });
    }

    // Update Shop aggregates
    console.log("🏪 Calculating shop aggregates (totalSales, rating)...");
    for (const shop of shops) {
        const shopProducts = await prisma.product.findMany({
            where: { shopId: shop.id }
        });

        const totalSales = shopProducts.reduce((acc, prod) => acc + prod.soldCount, 0);

        const ratedProducts = shopProducts.filter(p => p.reviewCount > 0);
        const avgRating = ratedProducts.length > 0
            ? (ratedProducts.reduce((acc, p) => acc + Number(p.rating), 0) / ratedProducts.length)
            : 4.5;

        await prisma.shop.update({
            where: { id: shop.id },
            data: {
                totalSales,
                rating: parseFloat(avgRating.toFixed(2))
            }
        });
    }

    // Calculate Shop Balances
    console.log("💼 Calculating and upserting shop balances...");
    for (const shop of shops) {
        const deliveredOrders = await prisma.order.findMany({
            where: {
                shopId: shop.id,
                status: 'delivered',
            }
        });

        let balance = 0;
        let pendingBalance = 0;

        for (const order of deliveredOrders) {
            const totalVal = Number(order.total);
            if (order.isSettled) {
                const orderCommission = Math.round(totalVal * commissionRate);
                balance += (totalVal - orderCommission);
            } else {
                pendingBalance += totalVal;
            }
        }

        await prisma.shopBalance.upsert({
            where: { shopId: shop.id },
            update: {
                balance,
                pendingBalance,
            },
            create: {
                shopId: shop.id,
                balance,
                pendingBalance,
            }
        });

        console.log(`   Shop ID ${shop.id} (${shop.name}): Balance = ${balance.toLocaleString()} VND, Pending Balance = ${pendingBalance.toLocaleString()} VND`);
    }

    console.log("🚀 Seeding completed successfully for all tables!");
}

main()
    .catch((e) => {
        console.error("❌ Error in seed script:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
        await pool.end();
    });
