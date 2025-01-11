import * as dotenv from "dotenv";
dotenv.config();

import { NestFactory } from '@nestjs/core';
import { SurveyModule } from './survey.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
	const app = await NestFactory.createMicroservice<MicroserviceOptions>(SurveyModule, {
		transport: Transport.TCP,
		options: { host: '127.0.0.1', port: +process.env.SURVEY_MICROSERVICE_PORT },
	});

	await app.listen();
	console.log(`Survey Microservice is running on port ${+process.env.SURVEY_MICROSERVICE_PORT}`);
}
bootstrap();
