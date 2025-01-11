import { Body, Controller, Delete, Get, HttpCode, Param, Post, Put, Req, Request } from '@nestjs/common';
import { GatewayService } from '../services/gateway.service';
import { CreateFieldDto, CreateSurveyDto, UpdateFieldDto, UpdateSurveyDto } from '@common';

@Controller('survey')
export class SurveyController {
    constructor(private gatewayService: GatewayService) {}

    @Get('/')
    async getAllSurveys(@Request() req) {
        const data = { authorization: req.headers.authorization };
        return await this.gatewayService.contactSurveyMicroservices("getAllSurveys", data)
    }

    @Get(':surveyId')
    async getSurvey(@Param('surveyId') surveyId: number, @Request() req) {
        const data = { authorization: req.headers.authorization, surveyId };
        return await this.gatewayService.contactSurveyMicroservices("getSurvey", data);
    }

    @Post('/:surveyId/clone')
    cloneSurvey(@Param('surveyId') surveyId: number, @Request() req) {
        const data = { authorization: req.headers.authorization, surveyId };
        return this.gatewayService.contactSurveyMicroservices("clone-survey", data);
    }

    @Post('/')
    createSurvey(@Body() creationInformation: CreateSurveyDto, @Request() req) {
        const data = { creationInformation, authorization: req.headers.authorization }
        return this.gatewayService.contactSurveyMicroservices("create-survey", data);
    }

    @Post('/:surveyId/field')
    createField(@Param('surveyId') surveyId: string, @Body() fieldInformation: CreateFieldDto, @Req() req) {
        const data = { surveyId, fieldInformation, authorization: req.headers.authorization }
        return this.gatewayService.contactSurveyMicroservices("create-field", data);
    }

    @HttpCode(204)
    @Delete(':surveyId')
    async deleteSurvey(@Param('surveyId') surveyId: string, @Req() req) {
        const data = { surveyId, authorization: req.headers.authorization }
        await this.gatewayService.contactSurveyMicroservices("delete-survey", data);
        return;
    }

    @HttpCode(204)
    @Delete(':surveyId/field/:fieldId')
    async deleteField(@Param('fieldId') fieldId: string, @Param('surveyId') surveyId: string, @Req() req) {
        const data = { fieldId, surveyId, authorization: req.headers.authorization }
        await this.gatewayService.contactSurveyMicroservices("delete-field", data);
        return;
    }

    @Put(':surveyId')
    updateSurvey(@Param('surveyId') surveyId: number, @Body() modificationInformations: UpdateSurveyDto, @Req() req) {
        const data = { surveyId, modificationInformations, authorization: req.headers.authorization };
        return this.gatewayService.contactSurveyMicroservices("update-survey", data);
    }

    @Put(':surveyId/field/:fieldId')
    async updateField(
        @Param('fieldId') fieldId: number,
        @Param('surveyId') surveyId: number,
        @Body() fieldInformation: UpdateFieldDto,
        @Req() req
    ) {
        const data = { surveyId, fieldId, fieldInformation, authorization: req.headers.authorization };
        await this.gatewayService.contactSurveyMicroservices("update-field", data);
        return;
    }
}