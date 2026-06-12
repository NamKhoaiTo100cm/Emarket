import { IsEnum, IsOptional, IsString } from 'class-validator';
import { VerificationStatus } from '../../generated/prisma/enums';

export class ReviewVerificationDto {
    @IsEnum(VerificationStatus)
    status: 'approved' | 'rejected';

    @IsOptional()
    @IsString()
    staffNote?: string;
}
