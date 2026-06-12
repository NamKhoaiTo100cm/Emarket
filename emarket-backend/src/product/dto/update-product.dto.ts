import { PartialType } from '@nestjs/mapped-types';
import { CreateProductDto } from './create-product.dto';
import { IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateProductDto {
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    description?: string;

    @IsOptional()
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

    @IsOptional()
    @IsInt()
    @Min(0)
    @Type(() => Number)
    stock: number;

    @IsOptional()
    isFeatured?: boolean;
}
