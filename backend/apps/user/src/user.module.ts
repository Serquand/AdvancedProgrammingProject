import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getDatabaseConfigFromEnv, User, RefreshToken } from '@common';
import { AuthLibService } from '@app/auth-lib';

@Module({
	imports: [
		ConfigModule.forRoot({ isGlobal: true }),
		TypeOrmModule.forRoot(getDatabaseConfigFromEnv(process.env)),
		TypeOrmModule.forFeature([User, RefreshToken]),
	],
	controllers: [UserController],
	providers: [UserService, AuthLibService],
})
export class UserModule { }
