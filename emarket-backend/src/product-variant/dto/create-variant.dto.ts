import { Type } from 'class-transformer';
import { IsString, IsNotEmpty, IsOptional, IsInt, IsNumber, Min } from 'class-validator';

export class CreateVariantDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsNumber()
    @Min(0)
    @Type(() => Number)
    price: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    @Type(() => Number)
    salePrice?: number;

    @IsInt()
    @Min(0)
    @Type(() => Number)
    stock: number;

    @IsOptional()
    @IsInt()
    @Min(0)
    @Type(() => Number)
    sortOrder?: number;
}
