import { IsBoolean, IsInt, IsString, Max, Min, IsArray, IsOptional } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class CreateReviewDto {

    @IsInt()
    @Type(() => Number)
    productId: number;

    @IsInt()
    @Type(() => Number)
    orderId: number;

    @IsInt()
    @Min(1)
    @Max(5)
    @Type(() => Number)
    rating: number;

    @IsString()
    @Type(() => String)
    comment: string;

    @IsBoolean()
    @Transform(({ value }) => {
        if (value === 'true' || value === true) return true;
        if (value === 'false' || value === false) return false;
        return value;
    })
    isHidden: boolean;

    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    reviewImages?: string[];
}
