import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreatePlatformVoucherDto } from './create-platform-voucher.dto';

// Dùng chung cho cả platform lẫn shop, không cho đổi code
export class UpdateVoucherDto extends PartialType(
    OmitType(CreatePlatformVoucherDto, ['code'] as const),
) { }