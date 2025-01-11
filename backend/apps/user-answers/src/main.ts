import * as dotenv from "dotenv";
dotenv.config();

import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { UserAnswersModule } from './user-answers.module';

async function bootstrap() {
	const app = await NestFactory.createMicroservice<MicroserviceOptions>(UserAnswersModule, {
		transport: Transport.TCP,
		options: {
			host: '127.0.0.1',
			port: +process.env.USER_ANSWERS_MICROSERVICE_PORT,
		},
	});

	await app.listen();
	console.log(`User Answers Microservice is running on port ${+process.env.USER_ANSWERS_MICROSERVICE_PORT}`);
}

bootstrap();
