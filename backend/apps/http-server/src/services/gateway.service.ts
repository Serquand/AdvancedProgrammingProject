import { Injectable } from '@nestjs/common';
import { ClientProxy, ClientProxyFactory, Transport } from '@nestjs/microservices';
import { firstValueFrom, map, Observable } from 'rxjs';
import { rpcExceptionFilter } from '../filter/rcp-exception.filter';

@Injectable()
export class GatewayService {
    private userAnswerServiceClient: ClientProxy;
    private userServiceClient: ClientProxy;
    private authServiceClient: ClientProxy;
    private surveyServiceClient: ClientProxy;
    private organizationServiceClient: ClientProxy;

    constructor() {
        this.userAnswerServiceClient = ClientProxyFactory.create({
            transport: Transport.TCP,
            options: { host: '127.0.0.1', port: +process.env.USER_ANSWERS_MICROSERVICE_PORT },
        });

        this.userServiceClient = ClientProxyFactory.create({
            transport: Transport.TCP,
            options: { host: '127.0.0.1', port: +process.env.USER_MICROSERVICE_PORT },
        });

        this.authServiceClient = ClientProxyFactory.create({
            transport: Transport.TCP,
            options: { host: '127.0.0.1', port: +process.env.AUTH_MICROSERVICE_PORT },
        });

        this.surveyServiceClient = ClientProxyFactory.create({
            transport: Transport.TCP,
            options: { host: '127.0.0.1', port: +process.env.SURVEY_MICROSERVICE_PORT },
        });

        this.organizationServiceClient = ClientProxyFactory.create({
            transport: Transport.TCP,
            options: { host: '127.0.0.1', port: +process.env.ORGANIZATION_MICROSERVICE_PORT },
        });
    }

    async convertObservableToData(observabledValue: Observable<string>): Promise<any> {
        return firstValueFrom(observabledValue.pipe(map(response => response)));
    }

    private async callMicroservice<T>(client: ClientProxy, cmdName: string, payload: T): Promise<any> {
        try {
            const request = client.send<string, T>({ cmd: cmdName }, payload)
            const data = await this.convertObservableToData(request);
            return data;
        } catch (err) {
            rpcExceptionFilter(err);
        }
    }

    async contactUserMicroservices<T>(cmdName: string, payload: T): Promise<any> {
        return await this.callMicroservice(this.userServiceClient, cmdName, payload);
    }

    async contactAuthMicroservices(cmdName: string, payload: any): Promise<any> {
        return await this.callMicroservice(this.authServiceClient, cmdName, payload);
    }

    async contactSurveyMicroservices(cmdName: string, payload: any): Promise<any> {
        return await this.callMicroservice(this.surveyServiceClient, cmdName, payload);
    }

    async contactOrganizationMicroservices(cmdName: string, payload: any): Promise<any> {
        return await this.callMicroservice(this.organizationServiceClient, cmdName, payload);
    }

    async contactUserAnswerMicroservices(cmdName: string, payload: any): Promise<any> {
        return await this.callMicroservice(this.userAnswerServiceClient, cmdName, payload);
    }
}
