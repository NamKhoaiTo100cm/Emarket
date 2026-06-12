import 'dotenv/config';
import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

// Initialize prisma with adapter
const prisma = new PrismaClient({
    adapter: new PrismaPg({
        connectionString: process.env.DATABASE_URL,
    }),
});

async function main() {
    // 1. Get all shops that have products
    const shops = await prisma.shop.findMany({
        where: {
            products: {
                some: {}
            }
        },
        include: {
            products: {
                take: 5,
                include: {
                    images: true
                }
            }
        }
    });

    if (shops.length === 0) {
        console.error("❌ No shops with products found in DB!");
        return;
    }

    // 2. Get first user to act as buyer
    const user = await prisma.user.findFirst();
    if (!user) {
        console.error("❌ No user found in DB!");
        return;
    }
    console.log(`👤 Using user: ${user.name} (ID: ${user.id}) as buyer.`);

    const statuses = ['delivered', 'delivered', 'delivered', 'delivered', 'cancelled', 'shipping', 'confirmed', 'pending'];
    const addressList = ['Hà Nội', 'Hồ Chí Minh', 'Đà Nẵng', 'Hải Phòng', 'Quảng Ninh'];
    const names = ['Nguyễn Văn A', 'Trần Thị B', 'Lê Hoàng C', 'Phạm Minh D', 'Hoàng Anh E'];

    for (const shop of shops) {
        console.log(`--------------------------------------------------`);
        console.log(`🔍 Processing shop: ${shop.name} (ID: ${shop.id}) with ${shop.products.length} products.`);

        // 3. Clear existing orders for this shop to get a clean chart
        console.log(`🗑️ Clearing existing orders for shop ID ${shop.id} to ensure clean statistics...`);
        
        // First clear review images linked to shop orders
        await prisma.reviewImage.deleteMany({
            where: {
                review: {
                    order: {
                        shopId: shop.id
                    }
                }
            }
        });

        // Then clear reviews linked to shop orders
        await prisma.review.deleteMany({
            where: {
                order: {
                    shopId: shop.id
                }
            }
        });

        // Then clear order items linked to shop orders
        await prisma.orderItem.deleteMany({
            where: {
                order: {
                    shopId: shop.id
                }
            }
        });

        // Clear withdrawal requests for this shop
        await prisma.withdrawalRequest.deleteMany({
            where: {
                shopId: shop.id
            }
        });
        
        // Then delete the orders
        await prisma.order.deleteMany({
            where: {
                shopId: shop.id
            }
        });

        // 4. Create orders for the last 30 days
        let orderCount = 0;
        let shopBalance = 0;
        let shopPendingBalance = 0;
        const now = new Date();
        console.log(`🌱 Generating fake orders for the last 30 days...`);

        for (let i = 30; i >= 0; i--) {
            const orderDate = new Date();
            orderDate.setDate(orderDate.getDate() - i);
            
            // Random 1 to 4 orders per day
            const dailyCount = Math.floor(Math.random() * 4) + 1;

            for (let j = 0; j < dailyCount; j++) {
                const status = statuses[Math.floor(Math.random() * statuses.length)];
                const isDelivered = status === 'delivered';
                const paymentStatus = isDelivered ? 'paid' : 'pending';
                
                // Pick a random product from shop
                const product = shop.products[Math.floor(Math.random() * shop.products.length)];
                const quantity = Math.floor(Math.random() * 3) + 1;
                const price = Number(product.price);
                const subtotal = price * quantity;
                const shippingFee = 10000;
                const total = subtotal + shippingFee;

                const orderTime = new Date(orderDate);
                // Distribute hours randomly
                orderTime.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60));

                let settlementAt: Date | null = null;
                let isSettled = false;

                if (isDelivered) {
                    settlementAt = new Date(orderTime);
                    settlementAt.setDate(settlementAt.getDate() + 3);

                    if (settlementAt <= now) {
                        isSettled = true;
                        shopBalance += total;
                    } else {
                        isSettled = false;
                        shopPendingBalance += total;
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
                        receiverName: names[Math.floor(Math.random() * names.length)],
                        receiverPhone: '0987654321',
                        paymentMethod: 'cod',
                        paymentStatus: paymentStatus as any,
                        shippingMethod: 'standard',
                        status: status as any,
                        createdAt: orderTime,
                        updatedAt: orderTime,
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

                orderCount++;
            }
        }

        // Upsert ShopBalance with final calculated amounts
        await prisma.shopBalance.upsert({
            where: { shopId: shop.id },
            update: {
                balance: shopBalance,
                pendingBalance: shopPendingBalance,
            },
            create: {
                shopId: shop.id,
                balance: shopBalance,
                pendingBalance: shopPendingBalance,
            }
        });

        console.log(`🎉 Successfully created ${orderCount} fake orders for shop: ${shop.name}!`);
    }
}

main()
    .catch((err) => {
        console.error("❌ Error running script:", err);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
