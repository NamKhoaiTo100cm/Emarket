import { Body, Controller, Get, Post, Req, Request, Res, UnauthorizedException, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import express from 'express'; // Import chuẩn
import { Public } from '../common/decorators/public.decorator';
@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Public()
    @Post('login')
    async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: express.Response) {
        const { access_token, refresh_token, user } = await this.authService.login(dto);

        res.cookie('access_token', access_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 15 * 60 * 1000,
        });

        res.cookie('refresh_token', refresh_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        // ✅ bỏ password và hashRefreshToken
        const { password, hashRefreshToken, ...safeUser } = user;

        return {
            message: 'Đăng nhập thành công',
            data: {
                access_token: access_token,
                refresh_token: refresh_token,
                user: safeUser,
            }
        };
    }


    @Get('me')
    getMe(@Request() req: any) {
        return this.authService.getMe(req.user.id);
    }

    @Public()
    @Post('logout')
    logout(@Res({ passthrough: true }) res: express.Response) {
        res.clearCookie('access_token');
        res.clearCookie('refresh_token');
        return { message: 'logged out' };
    }

    @Public()
    @Post('refresh')
    async refresh(@Req() req, @Res({ passthrough: true }) res: express.Response) {
        const refreshToken = req.cookies['refresh_token'];
        if (!refreshToken) throw new UnauthorizedException();
        console.log("user rf", refreshToken);

        const result = await this.authService.refreshTokens(refreshToken);

        res.cookie('access_token', result.access_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 15 * 60 * 1000,
        });

        return { message: 'refreshed' };
    }

    @Public()
    @Get('google')
    @UseGuards(AuthGuard('google'))
    googleLogin() { }


    @Public()
    @Get('google/callback')
    @UseGuards(AuthGuard('google'))
    async googleCallback(@Req() req, @Res() res: express.Response) {
        const user = req.user;

        const { access_token, refresh_token } = await this.authService.loginByGoogle(user);

        res.cookie('access_token', access_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 15 * 60 * 1000,
        });

        res.cookie('refresh_token', refresh_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        res.redirect(`${process.env.FRONTEND_URL}/callback`);
    }

}