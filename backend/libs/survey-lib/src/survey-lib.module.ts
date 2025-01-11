import { Module } from '@nestjs/common';
import { SurveyLibService } from './survey-lib.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Form, FormField, FormFieldSelectChoices, getDatabaseConfigFromEnv } from '@common';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        TypeOrmModule.forRoot({...getDatabaseConfigFromEnv(process.env)}),
        TypeOrmModule.forFeature([Form, FormField, FormFieldSelectChoices]),
    ],
    providers: [SurveyLibService],
    exports: [SurveyLibService],
})
export class SurveyLibModule { }
