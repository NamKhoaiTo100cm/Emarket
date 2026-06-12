import { IsBoolean, IsInt, IsNotEmpty, IsOptional } from "class-validator";

export class CreateProductImageDto {
    @IsInt()
    @IsNotEmpty()
    productId: number;
    @IsBoolean()
    @IsOptional()
    isMain?: boolean;
}
