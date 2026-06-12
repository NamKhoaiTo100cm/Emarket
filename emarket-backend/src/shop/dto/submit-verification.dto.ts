import { IsOptional, IsString } from 'class-validator';

export class SubmitVerificationDto {
    @IsOptional()
    @IsString()
    note?: string;
}
