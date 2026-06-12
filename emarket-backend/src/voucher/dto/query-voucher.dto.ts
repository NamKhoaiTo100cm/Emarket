import { IsEnum, IsOptional, IsNumberString, IsString } from 'class-validator';
import { VoucherScope } from '../../generated/prisma/enums';

export class QueryVoucherDto {
    @IsEnum(VoucherScope)
    @IsOptional()
    scope?: VoucherScope;

    @IsNumberString()
    @IsOptional()
    shopId?: string;

    @IsString()
    @IsOptional()
    search?: string; // tìm theo code

    @IsNumberString()
    @IsOptional()
    page?: string = '1';

    @IsNumberString()
    @IsOptional()
    limit?: string = '20';
}