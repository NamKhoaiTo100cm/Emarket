import { Transform, Type } from 'class-transformer';
import { IsString, IsOptional, IsEnum, IsInt, IsBoolean } from 'class-validator';
import { BannerPosition } from 'src/generated/prisma/enums';

export class CreateBannerDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  link?: string;

  @IsOptional()
  @IsEnum(BannerPosition)
  position?: BannerPosition;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return value;
  })
  active?: boolean;
}
