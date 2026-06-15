import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
    ) { }

    // Hàm tạo cặp Token để tái sử dụng
    async generateTokens(payload: { sub: number; email: string, role: string }) {
        const [at, rt] = await Promise.all([
            this.jwtService.signAsync(payload, {
                expiresIn: '15m',
                secret: process.env.JWT_AT_SECRET, // Nên có secret riêng
            }),
            this.jwtService.signAsync(payload, {
                expiresIn: '7d',
                secret: process.env.JWT_RT_SECRET, // Nên có secret riêng
            }),
        ]);

        return {
            access_token: at,
            refresh_token: rt,
        };
    }

    async login(dto: LoginDto) {
        const user = await this.prisma.user.findUnique({
            where: { email: dto.email },
            include: {
                shop: {
                    select: {
                        userId: true,
                    }
                }
            }
        });

        if (!user) throw new UnauthorizedException('Email hoặc mật khẩu sai');
        if (user.status === 'banned') {
            throw new UnauthorizedException('Tài khoản của bạn đã bị khóa');
        }

        const isMatch = await bcrypt.compare(dto.password, user.password || '');
        if (!isMatch) throw new UnauthorizedException('Email hoặc mật khẩu sai');

        const payload = { sub: user.id, email: user.email, role: user.role };
        const token = await this.generateTokens(payload);
        await this.prisma.user.update({
            where: { id: user.id },
            data: {
                hashRefreshToken: token.refresh_token,
            }
        });
        return { access_token: token.access_token, refresh_token: token.refresh_token, user: user }
    }

    async refreshTokens(refreshToken: string) {
        console.log("get refreshToken", refreshToken);

        try {
            // 1. Verify token
            const payload = await this.jwtService.verifyAsync(refreshToken, {
                secret: process.env.JWT_RT_SECRET,
            });

            // 2. (Tùy chọn) Kiểm tra user còn tồn tại trong DB không
            const user = await this.prisma.user.findUnique({
                where: { id: payload.sub },
                include: {
                    shop: {
                        select: {
                            id: true,
                        }
                    }
                }
            });
            if (!user) throw new UnauthorizedException();
            if (user.status === 'banned') {
                throw new UnauthorizedException('Tài khoản của bạn đã bị khóa');
            }

            // 3. Tạo Access Token mới (thường không cần tạo lại Refresh Token trừ khi bạn muốn rotate)
            const newPayload = { sub: user.id, email: user.email, role: user.role };
            const access_token = await this.jwtService.signAsync(newPayload, {
                expiresIn: '15m',
                secret: process.env.JWT_AT_SECRET,
            });

            return { access_token };
        } catch (e) {
            // Nếu token hết hạn hoặc sai chữ ký, verifyAsync sẽ bắn lỗi
            throw new UnauthorizedException('Token không hợp lệ hoặc đã hết hạn');
        }
    }

    async getMe(userId: number) {
        return this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                role: true,
                createdAt: true,
                shop: {
                    select: {
                        id: true,
                        status: true,
                    }
                }
            },
        });
    }

    async loginByGoogle(user: { id: number, email: string; name: string; avatar?: string; googleId: string, role: string }) {
        const userDb = await this.prisma.user.findUnique({
            where: { id: user.id },
            select: { status: true },
        });
        if (userDb && userDb.status === 'banned') {
            throw new UnauthorizedException('Tài khoản của bạn đã bị khóa');
        }

        // generateTokens cần đúng shape { sub, email }
        const { access_token, refresh_token } = await this.generateTokens({
            sub: user.id,
            email: user.email,
            role: user.role
        });

        // Lưu refresh token vào DB luôn như flow login thường
        await this.saveRefreshToken(user.id, refresh_token);
        return { access_token: access_token, refresh_token: refresh_token, user: user }
    }

    async saveRefreshToken(userId: number, refreshToken: string) {
        await this.prisma.user.update({
            where: { id: userId },
            data: { hashRefreshToken: refreshToken },
        });
    }
}