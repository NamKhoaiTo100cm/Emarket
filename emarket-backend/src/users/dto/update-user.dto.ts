import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { Role, UserStatus } from '../../generated/prisma/enums';
import { IsOptional, IsString } from 'class-validator';

export class UpdateUserDto extends PartialType(CreateUserDto) {
    status?: UserStatus;
    role?: Role;

    @IsString()
    @IsOptional()
    address?: string;

    @IsString()
    @IsOptional()
    avatar?: string;
}
