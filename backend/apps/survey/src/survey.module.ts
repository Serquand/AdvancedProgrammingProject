import { Module } from '@nestjs/common';
import { SurveyController } from './survey.controller';
import { SurveyService } from './survey.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getDatabaseConfigFromEnv, Form, FormField, FormFieldSelectChoices } from '@common';
import { NotificationsService } from '@app/notifications';
import { AuthLibService } from '@app/auth-lib';
import { SurveyLibService } from '@app/survey-lib';

@Module({
	imports: [
		ConfigModule.forRoot({ isGlobal: true }),
		TypeOrmModule.forRoot({ ...getDatabaseConfigFromEnv(process.env) }),
		TypeOrmModule.forFeature([Form, FormField, FormFieldSelectChoices])
	],
	controllers: [SurveyController],
	providers: [SurveyService, NotificationsService, AuthLibService, SurveyLibService],
})
export class SurveyModule { }
