import { Optional } from "@nestjs/common";
import { Type } from "class-transformer";
import { ArrayMinSize, IsArray, IsDefined, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Min, ValidateNested } from "class-validator";
import { OrderStatus, PaymentMethod, PaymentStatus, ShippingMethod } from "../../generated/prisma/enums";
import { CreateOrderItemDto } from "./create-order-item.dto";

export class CreateOrderDto {
    // @Min(1)
    // @IsDefined()
    // @Type(() => Number)
    // @IsNumber()
    // shopId: number;

    // @Min(0)
    // @IsDefined()
    // @Type(() => Number)
    // @IsNumber()
    // subtotal: number;

    // @Min(0)
    // @IsDefined()
    // @Type(() => Number)
    // @IsNumber()
    // shippingFee: number;

    // @Min(0)
    // @IsDefined()
    // @Type(() => Number)
    // @IsNumber()
    // discount: number;

    // @Min(0)
    // @IsDefined()
    // @Type(() => Number)
    // @IsNumber()
    // total: number;

    @IsNotEmpty()
    @IsDefined()
    @IsString()
    @Type(() => String)
    shippingAddress: string;

    @IsNotEmpty()
    @IsDefined()
    @IsString()
    @Type(() => String)
    receiverName: string;

    @IsNotEmpty()
    @IsDefined()
    @Type(() => Number)
    @IsNumber()
    receiverPhone: number;

    @IsNotEmpty()
    @IsDefined()
    @IsEnum(PaymentMethod)
    paymentMethod: PaymentMethod;

    @IsNotEmpty()
    @IsDefined()
    @IsEnum(ShippingMethod)
    shippingMethod: ShippingMethod;

    // @IsNotEmpty()
    // @IsDefined()
    // @IsEnum(PaymentStatus)
    // paymentStatus: PaymentStatus;
    // @IsEnum(OrderStatus)
    // status: OrderStatus;
    @IsOptional()
    @IsString()
    note: string;

    // @IsOptional()
    // @IsString()
    // voucherCode: string;

    @IsOptional()
    @IsString()
    shopVoucherCode?: string;

    @IsNotEmpty()
    @IsDefined()
    @IsArray()
    @ArrayMinSize(1)
    @ValidateNested({ each: true })
    @Type(() => CreateOrderItemDto)
    items: CreateOrderItemDto[]
}