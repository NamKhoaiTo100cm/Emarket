import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SystemConfigService implements OnModuleInit {
  constructor(private prisma: PrismaService) {}

  async onModuleInit() {
    // Seed default configs if not present
    try {
      const defaults = [
        { key: 'commission_rate', value: '5' },         // 5%
        { key: 'auto_confirm_minutes', value: '5' },     // 5 phút
      ];
      for (const cfg of defaults) {
        const existing = await this.prisma.systemConfig.findUnique({ where: { key: cfg.key } });
        if (!existing) {
          await this.prisma.systemConfig.create({ data: cfg });
        }
      }
    } catch (error) {
      console.warn('Failed to seed default system configurations (database table might not be ready yet):', error.message);
    }
  }

  async getCommissionRate(): Promise<number> {
    try {
      const config = await this.prisma.systemConfig.findUnique({
        where: { key: 'commission_rate' },
      });
      const val = config ? parseFloat(config.value) : 5;
      return isNaN(val) ? 0.05 : val / 100;
    } catch (error) {
      return 0.05; // Fallback to 5% if database query fails
    }
  }

  async getAutoConfirmMinutes(): Promise<number> {
    try {
      const config = await this.prisma.systemConfig.findUnique({
        where: { key: 'auto_confirm_minutes' },
      });
      const val = config ? parseInt(config.value, 10) : 5;
      return isNaN(val) || val <= 0 ? 5 : val;
    } catch {
      return 5; // Fallback to 5 minutes
    }
  }

  async get(key: string): Promise<string | null> {
    const config = await this.prisma.systemConfig.findUnique({
      where: { key },
    });
    return config ? config.value : null;
  }

  async set(key: string, value: string) {
    return this.prisma.systemConfig.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
  }

  async getAll() {
    return this.prisma.systemConfig.findMany({
      orderBy: { key: 'asc' },
    });
  }
}
