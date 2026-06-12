import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateConfigDto {
  @IsString()
  @IsNotEmpty()
  value: string;
}
