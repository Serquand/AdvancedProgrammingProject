import { Module } from '@nestjs/common';
import { UserAnswerController } from './user-answers.controller';
import { UserAnswerService } from './user-answer.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Form, FormField, FormFieldSelectChoices, FormFieldUserAnswer, SurveyPersonnalReviewGranted, getDatabaseConfigFromEnv } from '@common';
import { AuthLibService } from '@app/auth-lib';
import { SurveyLibService } from '@app/survey-lib';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        TypeOrmModule.forRoot(getDatabaseConfigFromEnv(process.env)),
        TypeOrmModule.forFeature([FormFieldUserAnswer, Form, FormFieldSelectChoices, FormField, SurveyPersonnalReviewGranted]),
    ],
    controllers: [UserAnswerController],
    providers: [UserAnswerService, AuthLibService, SurveyLibService],
})
export class UserAnswersModule { }
