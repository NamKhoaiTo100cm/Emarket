import 'dotenv/config';
import { PrismaClient } from './src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({
    adapter: new PrismaPg(pool),
});

async function main() {
    const total = await prisma.product.count({
        where: { status: { not: 'deleted' } }
    });
    const active = await prisma.product.count({
        where: { status: 'active' }
    });
    const inactive = await prisma.product.count({
        where: { status: 'inactive' }
    });
    const banned = await prisma.product.count({
        where: { status: 'banned' }
    });
    console.log("COUNTS IN DB:", { total, active, inactive, banned });
}

main().catch(console.error).finally(() => prisma.$disconnect());
