import * as dotenv from "dotenv";
dotenv.config();

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpsOptions } from '@nestjs/common/interfaces/external/https-options.interface';
import { readFileSync } from 'fs';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';
import corsOptions from './cors';

async function bootstrap() {
	let httpsOptions: HttpsOptions = undefined;
	if (process.env.NODE_ENV === 'production' && process.env.SSL_KEY_PATH && process.env.SSL_CERT_PATH) {
		httpsOptions = {
			key: readFileSync(process.env.SSL_KEY_PATH),
			cert: readFileSync(process.env.SSL_CERT_PATH),
		};
	}

	const app = await NestFactory.create(AppModule, { httpsOptions });

	const config = new DocumentBuilder()
		.setTitle('Surv\'Efrei - BackEnd')
		.setDescription('The backend for the Web app Surv\'Efrei')
		.setVersion('1.0')
		.build();
	const document = SwaggerModule.createDocument(app, config);
	SwaggerModule.setup('docs', app, document);

	app.use(cookieParser());

	app.useGlobalPipes(
		new ValidationPipe({
			whitelist: true,
			transform: true,
			forbidNonWhitelisted: true,
		}),
	);

	app.enableCors(corsOptions);

	await app.listen(process.env.HTTP_SERVER_PORT);
}

bootstrap();
