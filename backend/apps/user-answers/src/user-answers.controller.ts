import { Controller, InternalServerErrorException, NotFoundException, UseGuards } from '@nestjs/common';
import { CanAccessGlobalSurveyAnswer, CheckAnswersFormat, HasStudentAlreadyAnswerGuard, IsSurveyPublicGuard } from './user-answer.guard';
import { UserAnswerService } from './user-answer.service';
import { IsLoggedInGuard, IsStudentGuard, LoginPayload } from '@app/auth-lib';
import { SurveyLibService, SurveyExistGuard } from '@app/survey-lib';
import { MessagePattern, RpcException } from '@nestjs/microservices';
import { isArray } from 'class-validator';

@UseGuards(IsLoggedInGuard, SurveyExistGuard, IsSurveyPublicGuard)
@Controller('user-answer')
export class UserAnswerController {
    constructor(
        private userAnswerService: UserAnswerService,
        private surveyLibService: SurveyLibService,
    ) {}

    @MessagePattern({ cmd: "find-answers-survey" })
    async findAnswersForSurvey(data: {surveyId: number, user: LoginPayload}) {
        const { userId, role } = data.user;
        if(role === "admin") return await this.userAnswerService.getSurveyAnswersForAdmin(data.surveyId);
        if (role === "teacher") return await this.userAnswerService.getSurveyAnswerForTeacher(data.surveyId, userId);
        if (role === "student") return await this.userAnswerService.getSurveyAnswerForStudent(data.surveyId, userId);
        return [];
    }

    @UseGuards(CanAccessGlobalSurveyAnswer)
    @MessagePattern({ cmd: "find-answers-survey-for-user" })
    async getUserAnswerByUserId(data: { surveyId: number, userId: number }) {
        const answers = await this.userAnswerService.getSurveyAnswerForStudent(data.surveyId, data.userId);
        console.log(answers);
        if(isArray(answers) && answers.length === 0) {
            console.log("Here");
            throw new RpcException(new NotFoundException({
                en: "This user's answers for this form were not found!",
                fr: "Les réponses de cette utilisateur pour ce formulaire n'ont pas été trouvées !"
            }))
        }
        return answers;
    }

    @UseGuards(CanAccessGlobalSurveyAnswer)
    @MessagePattern({ cmd: "find-users-who-answered-survey" })
    async findUserListWhoAnsweredSurvey(data: {surveyId: number }) {
        return this.userAnswerService.getSurveyRespondents(data.surveyId);
    }

    @UseGuards(IsStudentGuard, HasStudentAlreadyAnswerGuard, CheckAnswersFormat)
    @MessagePattern({ cmd: "post-answers-survey" })
    async postAnswerByUser(data: {surveyId: number, user: LoginPayload, answers: Array<any>, acceptReview: boolean}) {
        const { userId } = data.user;
        try {
            const allSurvey = await this.surveyLibService.getSurveyAssignToUser(userId);
            const foundSurvey = allSurvey.filter(survey => survey.id === data.surveyId);
            if(!foundSurvey) {
                throw new RpcException(new NotFoundException({
                    en: "Survey not found !",
                    fr: "Formulaire non trouvé !"
                }));
            }

            await this.userAnswerService.savedUserAnswers(data.answers, userId);
            data.acceptReview && await this.userAnswerService.savedGrantReviewPermissionOfUser(data.surveyId, data.user.userId);

            return { message: "The answers has been successfully saved !" };
        } catch {
            return new InternalServerErrorException("Something went wrong !");
        }
    }
}
