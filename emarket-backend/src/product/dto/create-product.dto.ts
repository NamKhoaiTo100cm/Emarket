import { Type } from 'class-transformer';
import { IsString, IsNotEmpty, IsOptional, IsInt, IsNumber, Min } from 'class-validator';

export class CreateProductDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsNumber()
    @Min(0)
    @Type(() => Number)
    price: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    @Type(() => Number)
    salePrice?: number;

    @IsOptional()
    @IsInt()
    @Type(() => Number)
    categoryId?: number;

    @IsInt()
    @Min(0)
    @Type(() => Number)
    stock: number;

    @IsOptional()
    isFeatured?: boolean;

    @IsNumber()
    @Type(() => Number)
    shopId: number;
}