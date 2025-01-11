import { Inject, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User, RefreshToken, CreateUserDto, UpdateUserDto } from '@common';
import { Repository } from 'typeorm';
import { hash, verify } from 'argon2';
import { AuthLibService } from '@app/auth-lib';
import { v4 as uuidv4 } from 'uuid';
import { Cache, CACHE_MANAGER } from "@nestjs/cache-manager";
import * as dayjs from 'dayjs';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class AuthService {
	constructor(
		@InjectRepository(User) private readonly userRepository: Repository<User>,
		@InjectRepository(RefreshToken) private readonly refreshTokenRepository: Repository<RefreshToken>,
		@Inject(CACHE_MANAGER) private cacheManager: Cache,
		private authLibService: AuthLibService,
	) { }

	async updatePassword(userId: number, newPasswordHashed: string) {
		await this.userRepository.update({ id: userId }, { password: newPasswordHashed });
	}

	async registerUser(userToAdd: CreateUserDto) {
		const userToSave = { ...userToAdd };
		const hashedPassword = await this.authLibService.hashPassword(userToAdd.password);
		userToSave.password = hashedPassword;

		try {
			const { password, ...newUser } = await this.userRepository.save(userToSave); // eslint-disable-line
			return newUser;
		} catch {
			throw new RpcException(new InternalServerErrorException("Something went wrong"));
		}
	}

	async saveRefreshToken(userId: number, refreshToken: string) {
		const refreshTokenEntity = this.refreshTokenRepository.create({
			expiresAt: dayjs().add(30, 'days').toDate(),
			userId: userId,
			token: refreshToken
		});
		await this.refreshTokenRepository.save(refreshTokenEntity);
	}

	async getRefreshTokenStored(refreshToken: string) {
		return await this.refreshTokenRepository.findOne({ where: { token: refreshToken } });
	}

	async revokeRefreshToken(token: RefreshToken) {
		token.isRevoked = true;
		await this.refreshTokenRepository.save(token);
	}

	generateTokens(user: Partial<User>, rememberMe: boolean) {
		const payload = { email: user.email, userId: user.id, role: user.role }
		const accessToken = this.authLibService.generateToken(payload, { expiresIn: '1d' });
		const refreshToken = rememberMe ? this.authLibService.generateToken(payload, { expiresIn: '30d' }) : null;

		return { accessToken, refreshToken };
	}

	async verifyPassword(userPassword: string, sentPassword: string) {
		const isPasswordValid = await verify(userPassword, sentPassword);
		if (!isPasswordValid) throw new RpcException(new UnauthorizedException("Credentials are not valid !"));
	}

	async deleteUser(userId: number) {
		try {
			return await this.userRepository.delete({ id: userId });
		} catch {
			throw new RpcException(new InternalServerErrorException("Something went wrong !"));
		}
	}

	async getUserById(id: number) {
		return this.userRepository.findOne({ where: { id } });
	}

	async updateUser(userId: number, newUser: UpdateUserDto) {
		try {
			await this.userRepository.update(userId, newUser);
		} catch {
			throw new RpcException(new NotFoundException({ en: "User not found !", fr: "Utilisateur non trouvé !" }));
		}
	}

	async getUserByEmail(email: string, alsoSelectPassword: boolean = false): Promise<User> {
		const user = await this.userRepository.findOne({
			where: { email }, select: {
				password: alsoSelectPassword, email: true, firstName: true, id: true, lastName: true, role: true
			}
		});
		if (!user) {
			throw new RpcException(new NotFoundException({en: 'Email not found!', fr: 'Email non trouvé !' }));
		} else {
			return user;
		}
	}

	async generateResetToken(email: string) {
		const token = uuidv4();
		this.cacheManager.set(token, email, 15 * 60 * 1_000);
		return token;
	}

	async validateTokenAndEmail(email: string, token: string) {
		const storedEmail = await this.cacheManager.get(token);
		return (storedEmail && storedEmail === email);
	}
}