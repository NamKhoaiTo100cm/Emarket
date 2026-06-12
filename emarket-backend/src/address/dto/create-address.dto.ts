import { Type } from "class-transformer";
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateUserAddressDto {
    @IsString()
    @IsNotEmpty()
    receiverName: string;

    @IsString()
    @IsNotEmpty()
    receiverPhone: string;

    @IsString()
    @IsNotEmpty()
    province: string;

    @IsString()
    @IsNotEmpty()
    district: string;

    @IsString()
    @IsNotEmpty()
    ward: string;

    @IsString()
    @IsNotEmpty()
    addressLine: string;

    @IsBoolean()
    @Type(() => Boolean)
    @IsOptional()
    isDefault?: boolean;
}