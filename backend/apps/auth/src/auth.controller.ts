import { Body, Controller, InternalServerErrorException, Req, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { NotificationsService } from '@app/notifications';
import { ForgotPasswordDto, LoginDto, ResetPasswordDto, User } from '@common';
import { AuthService } from './auth.service';
import { AuthLibService } from '@app/auth-lib';
import { MessagePattern, RpcException } from '@nestjs/microservices';

@Controller('auth')
export class AuthController {
	constructor(
		private authService: AuthService,
		private readonly notificationService: NotificationsService,
		private authLibService: AuthLibService
	) { }

	@MessagePattern({ cmd: 'refresh-token' })
	async refresh(data: { refreshToken: string }) {
		const refreshToken = data.refreshToken;
		if (!refreshToken) throw new RpcException(new UnauthorizedException('No refresh token provided'));

		const token = await this.authService.getRefreshTokenStored(refreshToken);
		if (!token || token.isRevoked || token.expiresAt < new Date()) {
			throw new RpcException(new UnauthorizedException('Invalid or expired refresh token'));
		}

		const payload = this.authLibService.verifyToken(refreshToken)
		const user = { email: payload.email, id: payload.userId, role: payload.role }
		const { accessToken, refreshToken: newRefreshToken } = this.authService.generateTokens(user, true);

		await Promise.all([
			this.authService.revokeRefreshToken(token),
			this.authService.saveRefreshToken(payload.userId, newRefreshToken)
		]);

		return { accessToken, refreshToken: newRefreshToken };
	}

	@MessagePattern({ cmd: "login" })
	async login(data: LoginDto) {
		const userFound = await this.authService.getUserByEmail(data.email, true);
		await this.authService.verifyPassword(userFound.password, data.password);
		const { accessToken, refreshToken } = this.authService.generateTokens(userFound, data.rememberMe);
		data.rememberMe && await this.authService.saveRefreshToken(userFound.id, refreshToken);

		return { accessToken, refreshToken };
	}

	@MessagePattern({ cmd: 'logout' })
	async logout(data: { refreshToken: string }) {
		const refreshToken = data.refreshToken;
		if (!refreshToken) throw new RpcException(new UnauthorizedException("No refresh token provided !"));

		const token = await this.authService.getRefreshTokenStored(refreshToken);
		if (!token) throw new RpcException(new UnauthorizedException("Invalid refresh token !"));

		await this.authService.revokeRefreshToken(token);
	}


	@MessagePattern({ cmd: 'forgot-password' })
	async forgotPassword(data: ForgotPasswordDto): Promise<{ success: boolean }> {
		const { email } = data;
		try {
			const [user, token] = await Promise.all([this.authService.getUserByEmail(email), this.authService.generateResetToken(email)]);
			await this.notificationService.sendMailForRetrievePassword(user.lastName, user.firstName, token, user.email);

			return { success: true };
		} catch (error) {
			if (error instanceof RpcException) {
				throw error;
			}
			return { success: true };
		}
	}


	@MessagePattern({ cmd: 'reset-password' })
	async resetPassword(data: ResetPasswordDto) {
		const [user, isTokenValid] = await Promise.all([
			await this.authService.getUserByEmail(data.email),
			await this.authService.validateTokenAndEmail(data.email, data.token)
		]);
		if (!isTokenValid) throw new RpcException(new UnauthorizedException("Invalid token or email address"));

		try {
			const hashedPassword = await this.authLibService.hashPassword(data.password);
			await this.authService.updatePassword(user.id, hashedPassword);
		} catch (error) {
			throw new RpcException(new InternalServerErrorException("An error occurred while resetting the password."));
		}
		return { success: true };
	}
}