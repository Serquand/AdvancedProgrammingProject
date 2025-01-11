import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { UserController } from './controllers/user.controller';
import { GatewayService } from './services/gateway.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getDatabaseConfigFromEnv } from '@common';
import { AuthController } from './controllers/auth.controller';
import { SurveyController } from './controllers/survey.controller';
import { OrganizationController } from './controllers/organization.controller';
import { UserAnswerController } from './controllers/user-answer.controller';
import { LoggingMiddleware } from './middlewares/Logging.middleware';

@Module({
	imports: [
		ConfigModule.forRoot({ isGlobal: true }),
		TypeOrmModule.forRoot({ ...getDatabaseConfigFromEnv(process.env) }),
	],
	controllers: [
		UserController,
		AuthController,
		SurveyController,
		OrganizationController,
		UserAnswerController,
	],
	providers: [GatewayService],
})
export class AppModule implements NestModule {
	configure(consumer: MiddlewareConsumer) {
		consumer.apply(LoggingMiddleware).forRoutes('*');
	}
}
