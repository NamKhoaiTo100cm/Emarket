import { IsIn, IsNotEmpty, IsNumber } from 'class-validator';

export class CreateShopConversationDto {
    @IsNumber()
    @IsNotEmpty()
    shopId: number;
}

export class CreateSupportConversationDto {
    @IsIn(['user', 'shop'])
    @IsNotEmpty()
    type: 'user' | 'shop';
}

export class MarkReadDto {
    @IsIn(['user', 'seller', 'staff'])
    @IsNotEmpty()
    role: 'user' | 'seller' | 'staff';
}
