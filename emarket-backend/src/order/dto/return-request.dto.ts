import { IsEnum, IsNotEmpty, IsOptional, IsString, IsIn, IsArray } from 'class-validator';
import { ReturnStatus } from '../../generated/prisma/enums';

export class CreateReturnRequestDto {
  @IsString()
  @IsNotEmpty({ message: 'Lý do trả hàng không được để trống' })
  reason: string;

  @IsString()
  @IsOptional()
  bankName?: string;

  @IsString()
  @IsOptional()
  bankAccount?: string;

  @IsString()
  @IsOptional()
  bankOwner?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  images?: string[];
}

export class ResolveReturnRequestDto {
  @IsIn(['APPROVED', 'REJECTED'], { message: 'Trạng thái quyết định chỉ có thể là APPROVED hoặc REJECTED' })
  status: 'APPROVED' | 'REJECTED';

  @IsString()
  @IsOptional()
  staffNote?: string;
}
