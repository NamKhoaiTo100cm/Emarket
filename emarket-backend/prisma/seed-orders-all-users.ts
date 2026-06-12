import 'dotenv/config';
import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const prisma = new PrismaClient({
    adapter: new PrismaPg({
        connectionString: process.env.DATABASE_URL,
    }),
});

async function main() {
    // 1. Get all shops with products
    const shops = await prisma.shop.findMany({
        where: { products: { some: {} } },
        include: { products: { include: { images: true } } }
    });

    if (shops.length === 0) {
        console.error("❌ No shops with products found!");
        return;
    }

    // 2. Get all users
    const users = await prisma.user.findMany();
    if (users.length === 0) {
        console.error("❌ No users found!");
        return;
    }

    console.log(`👤 Found ${users.length} users in database.`);

    const statuses = ['delivered', 'delivered', 'delivered', 'cancelled', 'shipping', 'confirmed', 'pending'];
    const addressList = ['Hà Nội', 'Hồ Chí Minh', 'Đà Nẵng', 'Hải Phòng', 'Quảng Ninh'];
    const names = ['Nguyễn Văn A', 'Trần Thị B', 'Lê Hoàng C', 'Phạm Minh D', 'Hoàng Anh E'];

    for (const user of users) {
        console.log(`👤 Seeding orders for user: ${user.name} (ID: ${user.id}, Email: ${user.email})`);
        
        // Count existing orders
        const existingCount = await prisma.order.count({ where: { userId: user.id } });
        if (existingCount > 0) {
            console.log(`   User already has ${existingCount} orders. Skipping...`);
            continue;
        }

        // Create 3-5 orders for this user
        const numOrders = Math.floor(Math.random() * 3) + 3; // 3 to 5 orders
        for (let o = 0; o < numOrders; o++) {
            const shop = shops[Math.floor(Math.random() * shops.length)];
            const status = statuses[Math.floor(Math.random() * statuses.length)];
            const isDelivered = status === 'delivered';
            const paymentStatus = isDelivered ? 'paid' : 'pending';
            
            const product = shop.products[Math.floor(Math.random() * shop.products.length)];
            const quantity = Math.floor(Math.random() * 2) + 1;
            const price = Number(product.price);
            const subtotal = price * quantity;
            const shippingFee = 10000;
            const total = subtotal + shippingFee;

            const orderDate = new Date();
            // Random date in the last 5 days
            orderDate.setDate(orderDate.getDate() - Math.floor(Math.random() * 5));

            let settlementAt: Date | null = null;
            let isSettled = false;

            if (isDelivered) {
                settlementAt = new Date(orderDate);
                settlementAt.setDate(settlementAt.getDate() + 3);
                
                const now = new Date();
                if (settlementAt <= now) {
                    isSettled = true;
                }
            }

            const mainImage = product.images?.find((img) => img.isMain)?.imagePath || product.images?.[0]?.imagePath || '';

            await prisma.order.create({
                data: {
                    userId: user.id,
                    shopId: shop.id,
                    subtotal,
                    shippingFee,
                    discount: 0,
                    total,
                    shippingAddress: addressList[Math.floor(Math.random() * addressList.length)],
                    receiverName: user.name || names[Math.floor(Math.random() * names.length)],
                    receiverPhone: user.phone || '0987654321',
                    paymentMethod: 'cod',
                    paymentStatus: paymentStatus as any,
                    shippingMethod: 'standard',
                    status: status as any,
                    createdAt: orderDate,
                    updatedAt: orderDate,
                    settlementAt,
                    isSettled,
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
        }
        console.log(`   Created ${numOrders} orders successfully.`);
    }

    // 3. Recalculate all shop balances
    console.log("💼 Recalculating shop balances...");
    for (const shop of shops) {
        const now = new Date();
        const deliveredOrders = await prisma.order.findMany({
            where: {
                shopId: shop.id,
                status: 'delivered',
            }
        });

        let balance = 0;
        let pendingBalance = 0;

        for (const order of deliveredOrders) {
            if (order.settlementAt && order.settlementAt <= now) {
                balance += Number(order.total);
            } else {
                pendingBalance += Number(order.total);
            }
        }

        // Cap to avoid Decimal(10,2) overflow
        if (balance > 99000000) balance = 99000000;
        if (pendingBalance > 99000000) pendingBalance = 99000000;

        await prisma.shopBalance.upsert({
            where: { shopId: shop.id },
            update: { balance, pendingBalance },
            create: { shopId: shop.id, balance, pendingBalance }
        });
    }

    console.log("🎉 Seeding completed for all users!");
}

main()
    .catch((err) => console.error(err))
    .finally(() => prisma.$disconnect());
