import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getDatabaseConfigFromEnv, RefreshToken, User } from '@common';
import { AuthLibService } from '@app/auth-lib';
import { CacheModule } from '@nestjs/cache-manager';
import { NotificationsService } from '@app/notifications';

@Module({
	imports: [
		CacheModule.register(),
		ConfigModule.forRoot({ isGlobal: true }),
		TypeOrmModule.forRoot({...getDatabaseConfigFromEnv(process.env)}),
		TypeOrmModule.forFeature([User, RefreshToken]),
	],
	controllers: [AuthController],
	providers: [AuthService, AuthLibService, NotificationsService],
})
export class AuthModule { }
