import {
    IsEnum,
    IsOptional,
    IsString,
    IsNumber,
    IsBoolean,
    IsDateString,
    Min,
    IsNotEmpty,
} from 'class-validator';
import { DiscountType } from 'src/generated/prisma/enums';

export class CreatePlatformVoucherDto {
    @IsString()
    @IsNotEmpty()
    code: string;

    @IsEnum(DiscountType)
    @IsOptional()
    discountType?: DiscountType = DiscountType.fixed;

    @IsNumber()
    @Min(0)
    discountValue: number;

    @IsNumber()
    @Min(0)
    @IsOptional()
    minOrder?: number = 0;

    @IsNumber()
    @Min(0)
    @IsOptional()
    maxDiscount?: number;

    @IsNumber()
    @Min(1)
    @IsOptional()
    maxUses?: number = 100;

    @IsDateString()
    @IsOptional()
    startAt?: string;

    @IsDateString()
    @IsOptional()
    expiresAt?: string;

    @IsBoolean()
    @IsOptional()
    active?: boolean = true;
}