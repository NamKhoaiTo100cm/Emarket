import { IsNotEmpty, IsNumber, IsString, IsEnum } from 'class-validator';

export class CreateReportDto {
    @IsString()
    @IsNotEmpty()
    type: string; // 'product' | 'review' | 'shop'

    @IsNumber()
    @IsNotEmpty()
    targetId: number;

    @IsString()
    @IsNotEmpty()
    reason: string;
}

export class ResolveReportDto {
    @IsString()
    @IsNotEmpty()
    type: string; // 'product' | 'review' | 'shop'

    @IsNumber()
    @IsNotEmpty()
    targetId: number;

    @IsString()
    @IsNotEmpty()
    action: 'ban' | 'hide' | 'dismiss';
}
