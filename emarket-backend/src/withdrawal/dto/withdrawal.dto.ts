import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateWithdrawalDto {
    @IsNumber()
    @Min(10000)
    amount: number;

    @IsString()
    bankName: string;

    @IsString()
    bankAccount: string;

    @IsString()
    accountHolder: string;
}

export class ResolveWithdrawalDto {
    @IsString()
    status: 'APPROVED' | 'REJECTED';

    @IsString()
    @IsOptional()
    note?: string;
}