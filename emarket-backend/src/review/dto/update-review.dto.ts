import { PartialType } from '@nestjs/mapped-types';
import { CreateReviewDto } from './create-review.dto';
import { IsBoolean, IsNotEmpty, IsOptional } from 'class-validator';

export class UpdateReviewDto extends PartialType(CreateReviewDto) {
    @IsBoolean()
    @IsOptional()
    isHidden: boolean;
}
