import { Module } from '@nestjs/common';
import { SettlementService } from './settlement.service';
import { PrismaModule } from '../prisma/prisma.module';
import { SystemConfigModule } from '../system-config/system-config.module';

@Module({
  imports: [PrismaModule, SystemConfigModule],
  providers: [SettlementService]
})
export class SettlementModule { }
