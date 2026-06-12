import { IsBoolean, IsInt, IsString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

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
    @Type(() => Boolean)
    isHidden: boolean;



}
