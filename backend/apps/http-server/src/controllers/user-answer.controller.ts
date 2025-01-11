import { Body, Controller, Get, HttpCode, Param, Post, Req } from '@nestjs/common';
import { GatewayService } from '../services/gateway.service';
import { SubmitAnswersDTO } from '@common';

@Controller('user-answer')
export class UserAnswerController{
    constructor(private gatewayService: GatewayService) { }

    @Get('/:surveyId')
    async findAnswersForSurvey(@Param("surveyId") surveyId: number, @Req() req){
        const data = { authorization: req.headers.authorization, surveyId };
        return await this.gatewayService.contactUserAnswerMicroservices("find-answers-survey", data);
    }

    @Post('/:surveyId')
    @HttpCode(204)
    async postAnswerByUser(@Param("surveyId") surveyId: number, @Body() submittedAnswers: SubmitAnswersDTO, @Req() req) {
        const { acceptReview, answers } = submittedAnswers;
        const data = { authorization: req.headers.authorization, surveyId, acceptReview, answers };
        await this.gatewayService.contactUserAnswerMicroservices("post-answers-survey", data);
        return;
    }

    @Get("/:surveyId/list-respondents")
    async getListOfUserWhoAnswered(@Param("surveyId") surveyId: number, @Req() req) {
        const data = { authorization: req.headers.authorization, surveyId };
        return await this.gatewayService.contactUserAnswerMicroservices("find-users-who-answered-survey", data);
    }

    @Get("/:surveyId/:userId")
    async getUserAnswerByUserId(@Param("surveyId") surveyId: number, @Param("userId") userId: number, @Req() req) {
        const data = { authorization: req.headers.authorization, surveyId, userId };
        return await this.gatewayService.contactUserAnswerMicroservices("find-answers-survey-for-user", data);
    }
}