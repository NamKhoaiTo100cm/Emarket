import { Module } from '@nestjs/common';
import { SettlementService } from './settlement.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { SystemConfigModule } from 'src/system-config/system-config.module';

@Module({
  imports: [PrismaModule, SystemConfigModule],
  providers: [SettlementService]
})
export class SettlementModule { }
