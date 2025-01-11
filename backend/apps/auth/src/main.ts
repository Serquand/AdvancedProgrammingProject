import * as dotenv from "dotenv";
dotenv.config();

import { NestFactory } from '@nestjs/core';
import { AuthModule } from './auth.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
	const app = await NestFactory.createMicroservice<MicroserviceOptions>(AuthModule, {
		transport: Transport.TCP,
		options: { host: '127.0.0.1', port: +process.env.AUTH_MICROSERVICE_PORT },
	});

	await app.listen();
	console.log(`Survey Microservice is running on port ${+process.env.AUTH_MICROSERVICE_PORT}`);
}
bootstrap();
