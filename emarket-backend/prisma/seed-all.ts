import 'dotenv/config';
import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

// ==================== DATA ====================

const CATEGORIES = [
    { name: 'Thời trang nam', icon: '👕', slug: 'thoi-trang-nam' },
    { name: 'Thời trang nữ', icon: '👗', slug: 'thoi-trang-nu' },
    { name: 'Điện tử & Công nghệ', icon: '💻', slug: 'dien-tu-cong-nghe' },
    { name: 'Đồ gia dụng', icon: '🏠', slug: 'do-gia-dung' },
    { name: 'Sách & Văn phòng phẩm', icon: '📚', slug: 'sach-van-phong-pham' },
    { name: 'Mỹ phẩm & Làm đẹp', icon: '💄', slug: 'my-pham-lam-dep' },
    { name: 'Thể thao & Ngoài trời', icon: '⚽', slug: 'the-thao-ngoai-troi' },
    { name: 'Đồ ăn & Thực phẩm', icon: '🍜', slug: 'do-an-thuc-pham' },
];

const SELLERS = [
    { name: 'Nguyễn Văn An', email: 'seller1@emarket.com', shopName: 'Fashion Store An', shopAddress: '123 Nguyễn Trãi, Q.1, TP.HCM' },
    { name: 'Trần Thị Bình', email: 'seller2@emarket.com', shopName: 'Tech World Bình', shopAddress: '45 Lê Lợi, Q.Hải Châu, Đà Nẵng' },
    { name: 'Lê Hoàng Cường', email: 'seller3@emarket.com', shopName: 'Home & Living Cường', shopAddress: '78 Bà Triệu, Q.Hoàn Kiếm, Hà Nội' },
    { name: 'Phạm Thị Dung', email: 'seller4@emarket.com', shopName: 'Beauty Corner Dung', shopAddress: '12 Trần Hưng Đạo, Q.3, TP.HCM' },
    { name: 'Hoàng Minh Em', email: 'seller5@emarket.com', shopName: 'Sport Zone Em', shopAddress: '99 Võ Thị Sáu, Q.Bình Thạnh, TP.HCM' },
];

const USERS = [
    { name: 'Đinh Thị Phương', email: 'user1@emarket.com', phone: '0901234567' },
    { name: 'Vũ Quốc Khánh', email: 'user2@emarket.com', phone: '0912345678' },
    { name: 'Ngô Thị Lan', email: 'user3@emarket.com', phone: '0923456789' },
    { name: 'Đặng Văn Minh', email: 'user4@emarket.com', phone: '0934567890' },
    { name: 'Bùi Thị Ngọc', email: 'user5@emarket.com', phone: '0945678901' },
];

const PRODUCTS_BY_SHOP: { shopIndex: number; name: string; price: number; salePrice?: number; stock: number; imageUrl: string; categorySlug: string }[] = [
    // Shop 0 - Fashion
    { shopIndex: 0, name: 'Áo thun basic unisex cotton', price: 180000, salePrice: 149000, stock: 200, imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800', categorySlug: 'thoi-trang-nam' },
    { shopIndex: 0, name: 'Quần jean slim fit nam', price: 450000, salePrice: 380000, stock: 150, imageUrl: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=800', categorySlug: 'thoi-trang-nam' },
    { shopIndex: 0, name: 'Váy midi hoa nhí vintage', price: 320000, stock: 80, imageUrl: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=800', categorySlug: 'thoi-trang-nu' },
    { shopIndex: 0, name: 'Áo khoác dù chống nước', price: 550000, salePrice: 480000, stock: 60, imageUrl: 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=800', categorySlug: 'thoi-trang-nam' },
    { shopIndex: 0, name: 'Giày sneaker cổ thấp trắng', price: 750000, salePrice: 650000, stock: 100, imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800', categorySlug: 'thoi-trang-nam' },

    // Shop 1 - Tech
    { shopIndex: 1, name: 'Tai nghe bluetooth không dây', price: 890000, salePrice: 750000, stock: 120, imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800', categorySlug: 'dien-tu-cong-nghe' },
    { shopIndex: 1, name: 'Chuột gaming không dây RGB', price: 680000, salePrice: 580000, stock: 80, imageUrl: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800', categorySlug: 'dien-tu-cong-nghe' },
    { shopIndex: 1, name: 'Bàn phím cơ compact 75%', price: 1290000, stock: 50, imageUrl: 'https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=800', categorySlug: 'dien-tu-cong-nghe' },
    { shopIndex: 1, name: 'Đồng hồ thông minh thể thao', price: 1590000, salePrice: 1350000, stock: 40, imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800', categorySlug: 'dien-tu-cong-nghe' },
    { shopIndex: 1, name: 'Ốp lưng điện thoại silicon cao cấp', price: 89000, salePrice: 69000, stock: 500, imageUrl: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=800', categorySlug: 'dien-tu-cong-nghe' },

    // Shop 2 - Home
    { shopIndex: 2, name: 'Bình giữ nhiệt 500ml inox', price: 250000, salePrice: 199000, stock: 200, imageUrl: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800', categorySlug: 'do-gia-dung' },
    { shopIndex: 2, name: 'Đèn bàn LED học sinh', price: 320000, stock: 150, imageUrl: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800', categorySlug: 'do-gia-dung' },
    { shopIndex: 2, name: 'Gối ôm bông nhân tạo 60cm', price: 180000, salePrice: 149000, stock: 100, imageUrl: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=800', categorySlug: 'do-gia-dung' },
    { shopIndex: 2, name: 'Bộ dụng cụ nhà bếp inox 5 món', price: 450000, salePrice: 380000, stock: 80, imageUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800', categorySlug: 'do-gia-dung' },
    { shopIndex: 2, name: 'Ba lô laptop chống thấm 15.6"', price: 680000, salePrice: 580000, stock: 60, imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800', categorySlug: 'do-gia-dung' },

    // Shop 3 - Beauty
    { shopIndex: 3, name: 'Kem dưỡng da mặt SPF50 50ml', price: 380000, salePrice: 320000, stock: 200, imageUrl: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=800', categorySlug: 'my-pham-lam-dep' },
    { shopIndex: 3, name: 'Son môi lì lâu trôi 24h', price: 250000, salePrice: 199000, stock: 300, imageUrl: 'https://images.unsplash.com/photo-1586495777744-4e6232bf2f98?w=800', categorySlug: 'my-pham-lam-dep' },
    { shopIndex: 3, name: 'Máy sấy tóc mini du lịch 1200W', price: 480000, salePrice: 390000, stock: 100, imageUrl: 'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=800', categorySlug: 'my-pham-lam-dep' },
    { shopIndex: 3, name: 'Túi tote canvas in hình', price: 150000, stock: 400, imageUrl: 'https://images.unsplash.com/photo-1591561954557-26941169b49e?w=800', categorySlug: 'my-pham-lam-dep' },
    { shopIndex: 3, name: 'Serum vitamin C chống lão hóa', price: 550000, salePrice: 450000, stock: 150, imageUrl: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800', categorySlug: 'my-pham-lam-dep' },

    // Shop 4 - Sport
    { shopIndex: 4, name: 'Sách kỹ năng tư duy tích cực', price: 120000, salePrice: 99000, stock: 300, imageUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800', categorySlug: 'sach-van-phong-pham' },
    { shopIndex: 4, name: 'Bình nước thể thao 750ml', price: 200000, salePrice: 159000, stock: 200, imageUrl: 'https://images.unsplash.com/photo-1543253687-c931c8e01820?w=800', categorySlug: 'the-thao-ngoai-troi' },
    { shopIndex: 4, name: 'Dây kéo tập gym cao su', price: 280000, salePrice: 230000, stock: 150, imageUrl: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800', categorySlug: 'the-thao-ngoai-troi' },
    { shopIndex: 4, name: 'Giày chạy bộ nhẹ thoáng khí', price: 890000, salePrice: 750000, stock: 80, imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800', categorySlug: 'the-thao-ngoai-troi' },
    { shopIndex: 4, name: 'Áo thể thao tập gym nam', price: 250000, salePrice: 199000, stock: 200, imageUrl: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800', categorySlug: 'the-thao-ngoai-troi' },
];

// ==================== MAIN ====================

async function main() {
    console.log('🌱 Bắt đầu seed dữ liệu...\n');
    const password = await bcrypt.hash('123456', 10);

    // ── 1. Admin ──────────────────────────────────────────────
    console.log('👑 Tạo tài khoản Admin...');
    const existingAdmin = await prisma.user.findUnique({ where: { email: 'admin@emarket.com' } });
    if (!existingAdmin) {
        await prisma.user.create({
            data: { name: 'Admin Emarket', email: 'admin@emarket.com', password, role: 'admin' }
        });
        console.log('   ✅ admin@emarket.com / 123456');
    } else {
        console.log('   ⏭️  Admin đã tồn tại, bỏ qua.');
    }

    // ── 2. Staff ──────────────────────────────────────────────
    console.log('🛡️  Tạo tài khoản Staff...');
    const existingStaff = await prisma.user.findUnique({ where: { email: 'staff@emarket.com' } });
    if (!existingStaff) {
        await prisma.user.create({
            data: { name: 'Staff Kiểm Duyệt', email: 'staff@emarket.com', password, role: 'staff' }
        });
        console.log('   ✅ staff@emarket.com / 123456');
    } else {
        console.log('   ⏭️  Staff đã tồn tại, bỏ qua.');
    }

    // ── 3. SystemConfig ───────────────────────────────────────
    console.log('\n⚙️  Seed SystemConfig...');
    await prisma.systemConfig.upsert({
        where: { key: 'commission_rate' },
        update: {},
        create: { key: 'commission_rate', value: '5' },
    });
    await prisma.systemConfig.upsert({
        where: { key: 'auto_confirm_minutes' },
        update: {},
        create: { key: 'auto_confirm_minutes', value: '5' },
    });
    console.log('   ✅ commission_rate=5, auto_confirm_minutes=5');

    // ── 4. Categories ─────────────────────────────────────────
    console.log('\n🏷️  Seed Categories...');
    const categoryMap: Record<string, number> = {};
    for (const cat of CATEGORIES) {
        const existing = await prisma.category.findUnique({ where: { slug: cat.slug } });
        if (!existing) {
            const created = await prisma.category.create({ data: cat });
            categoryMap[cat.slug] = created.id;
            console.log(`   ✅ ${cat.name}`);
        } else {
            categoryMap[cat.slug] = existing.id;
            console.log(`   ⏭️  ${cat.name} đã tồn tại`);
        }
    }

    // ── 5. Sellers + Shops ────────────────────────────────────
    console.log('\n🏪 Tạo Sellers & Shops...');
    const shopIds: number[] = [];
    for (const s of SELLERS) {
        let user = await prisma.user.findUnique({ where: { email: s.email } });
        if (!user) {
            user = await prisma.user.create({
                data: { name: s.name, email: s.email, password, role: 'seller', phone: '0909090909' }
            });
        }

        let shop = await prisma.shop.findUnique({ where: { userId: user.id } });
        if (!shop) {
            shop = await prisma.shop.create({
                data: {
                    userId: user.id,
                    name: s.shopName,
                    description: `Cửa hàng ${s.shopName} - Uy tín, chất lượng, giá tốt nhất thị trường.`,
                    address: s.shopAddress,
                    phone: '0909090909',
                    status: 'active',
                    verificationStatus: 'approved',
                    rating: parseFloat((4 + Math.random()).toFixed(2)),
                    totalSales: Math.floor(Math.random() * 5000),
                }
            });
            console.log(`   ✅ Shop: ${s.shopName} (seller: ${s.email})`);
        } else {
            console.log(`   ⏭️  Shop ${s.shopName} đã tồn tại`);
        }
        shopIds.push(shop.id);
    }

    // ── 6. Users (buyers) ─────────────────────────────────────
    console.log('\n👤 Tạo Users...');
    for (const u of USERS) {
        const existing = await prisma.user.findUnique({ where: { email: u.email } });
        if (!existing) {
            await prisma.user.create({
                data: { name: u.name, email: u.email, password, phone: u.phone, role: 'user' }
            });
            console.log(`   ✅ ${u.email} / 123456`);
        } else {
            console.log(`   ⏭️  ${u.email} đã tồn tại`);
        }
    }

    // ── 7. Products ───────────────────────────────────────────
    console.log('\n📦 Tạo Products...');
    let productCount = 0;
    for (const p of PRODUCTS_BY_SHOP) {
        const shopId = shopIds[p.shopIndex];
        if (!shopId) continue;

        const categoryId = categoryMap[p.categorySlug] ?? null;

        const existing = await prisma.product.findFirst({
            where: { shopId, name: p.name }
        });
        if (existing) {
            console.log(`   ⏭️  "${p.name}" đã tồn tại`);
            continue;
        }

        const product = await prisma.product.create({
            data: {
                shopId,
                categoryId,
                name: p.name,
                description: `${p.name} - Sản phẩm chất lượng cao, được kiểm định kỹ lưỡng trước khi giao đến tay khách hàng.`,
                price: p.price.toString(),
                salePrice: p.salePrice?.toString() ?? null,
                stock: p.stock,
                soldCount: Math.floor(Math.random() * 3000),
                rating: parseFloat((3.5 + Math.random() * 1.5).toFixed(1)),
                reviewCount: Math.floor(Math.random() * 1000),
                status: 'active',
            }
        });

        await prisma.productImage.create({
            data: { productId: product.id, imagePath: p.imageUrl, isMain: true }
        });

        productCount++;
        console.log(`   ✅ [${productCount}] ${p.name}`);
    }

    console.log('\n🎉 Seed hoàn tất!');
    console.log('─────────────────────────────────────────');
    console.log('📋 Tài khoản test:');
    console.log('   admin@emarket.com   / 123456  (Admin)');
    console.log('   staff@emarket.com   / 123456  (Staff)');
    console.log('   seller1@emarket.com / 123456  (Seller)');
    console.log('   seller2@emarket.com / 123456  (Seller)');
    console.log('   user1@emarket.com   / 123456  (User)');
    console.log('   user2@emarket.com   / 123456  (User)');
    console.log('─────────────────────────────────────────');
}

main()
    .catch((err) => { console.error(err); process.exit(1); })
    .finally(() => prisma.$disconnect());
