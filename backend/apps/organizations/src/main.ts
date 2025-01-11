import * as dotenv from "dotenv";
dotenv.config();

import { NestFactory } from '@nestjs/core';
import { OrganizationsModule } from './organizations.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
    const app = await NestFactory.createMicroservice<MicroserviceOptions>(OrganizationsModule, {
        transport: Transport.TCP,
        options: { host: '127.0.0.1', port: +process.env.ORGANIZATION_MICROSERVICE_PORT },
    });

    await app.listen();
    console.log(`Organizations Microservice is running on port ${+process.env.ORGANIZATION_MICROSERVICE_PORT}`);
}
bootstrap();