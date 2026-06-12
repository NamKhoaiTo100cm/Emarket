import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './dto/jwt.strategy';
import { GoogleStrategy } from './strategies/google.strateegy';
import { UsersModule } from 'src/users/users.module';

@Module({
    imports: [
        UsersModule,
        JwtModule.registerAsync({
            imports: [ConfigModule],
            useFactory: (config: ConfigService) => ({
                // Secret mặc định của JwtService — auth.service.ts override
                // từng lần signAsync() bằng JWT_AT_SECRET / JWT_RT_SECRET riêng,
                // nên giá trị này chỉ là fallback an toàn, không ảnh hưởng logic.
                secret: config.get<string>('JWT_AT_SECRET'),
                signOptions: { expiresIn: '15m' },
            }),
            inject: [ConfigService],
        }),
    ],
    controllers: [AuthController],
    providers: [AuthService, JwtStrategy, GoogleStrategy],
})
export class AuthModule { }