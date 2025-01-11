import { Body, Controller, HttpCode, Post, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { ForgotPasswordDto, LoginDto, ResetPasswordDto } from '@common';
import { GatewayService } from '../services/gateway.service';
import { deleteCookies, setCookies } from '@common/tools/cookies';

@Controller('auth')
export class AuthController {
    constructor(private gatewayService: GatewayService) { }

    @HttpCode(200)
    @Post('refresh-token')
    async refresh(@Req() req: Request, @Res() res: Response) {
        const refreshToken = req.cookies['refreshToken'];
        const { accessToken, refreshToken: newRefreshToken } = await this.gatewayService.contactAuthMicroservices('refresh-token', { refreshToken });
        setCookies(res, 'refreshToken', newRefreshToken)

        return res.json({ accessToken });
    }

    @HttpCode(200)
    @Post('/login')
    async login(@Body() loginInformations: LoginDto, @Res() res: Response) {
        const { accessToken, refreshToken } = await this.gatewayService.contactAuthMicroservices("login", loginInformations);
        if(loginInformations.rememberMe) setCookies(res, 'refreshToken', refreshToken);
        else deleteCookies(res, 'refreshToken');
        return res.json({ accessToken });
    }

    @Post('logout')
    @HttpCode(204)
    async logout(@Req() req: Request) {
        const refreshToken = req.cookies.refreshToken;
        await this.gatewayService.contactAuthMicroservices("logout", { refreshToken });
        return;
    }

    @HttpCode(204)
    @Post('/forgot-password')
    async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
        await this.gatewayService.contactAuthMicroservices("forgot-password", forgotPasswordDto);
        return;
    }

    @HttpCode(204)
    @Post('/reset-password')
    async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
        await this.gatewayService.contactAuthMicroservices("reset-password", resetPasswordDto);
        return;
    }
}