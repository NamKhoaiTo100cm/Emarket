import { Type } from "class-transformer";
import { IsDefined, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from "class-validator";

export class CreateOrderItemDto {
    @Min(0)
    @IsNumber()
    @IsDefined()
    @Type(() => Number)
    productId: number;

    @Min(1)
    @IsNumber()
    @IsDefined()
    @Type(() => Number)
    quantity: number;

    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    variantId?: number;

    // @Min(1)
    // @IsNumber()
    // @IsDefined()
    // @Type(() => Number)
    // price: number;

    // @IsString()
    // @IsNotEmpty()
    // productName: string;

    // @IsString()
    // @IsOptional()
    // productImage: string;


}