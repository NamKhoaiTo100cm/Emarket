import { PartialType } from '@nestjs/mapped-types';
import { CreateCategoryDto } from './create-category.dto';
import { IsInt, IsOptional, IsString } from 'class-validator';

export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {
    @IsInt()
    @IsOptional()
    id?: number;

    @IsInt()
    @IsOptional()
    parentId?: number;

    @IsString()
    @IsOptional()
    name?: string;

    @IsString()
    @IsOptional()
    slug?: string;

    @IsString()
    @IsOptional()
    icon?: string;

    @IsInt()
    @IsOptional()
    sortOrder?: number;
}
