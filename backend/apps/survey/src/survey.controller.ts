import { Controller, InternalServerErrorException, NotFoundException, Param, UseGuards } from '@nestjs/common';
import { SurveyService } from './survey.service';
import { FieldExistGuard, IsValidSelectMenu, SurveyIsNotAlreadyPublished, SurveyMustContainsFieldsToBePublished } from './survey.guard';
import { IsAdminGuard, IsLoggedInGuard } from '@app/auth-lib';
import { Form, UserRoles, CreateFieldDto, CreateSurveyDto, UpdateFieldDto, UpdateSurveyDto } from '@common';
import { MessagePattern, RpcException } from '@nestjs/microservices';
import { SurveyExistGuard } from '@app/survey-lib';

@UseGuards(IsLoggedInGuard)
@Controller('survey')
export class SurveyController {
    constructor(private surveyService: SurveyService) {}

    @MessagePattern({ cmd: 'getAllSurveys' })
    async getAllSurveys(data: any) {
        const { role, userId } = data.user;
        switch (role) {
            case 'admin':
                return await this.surveyService.getAllSurveys();
            case 'teacher':
                return await this.surveyService.getSurveyAssignToUser(userId);
            case 'student':
                return await this.surveyService.getFilledSurveyAssignedToStudent(userId);
        }
    }

    @UseGuards(SurveyExistGuard)
    @MessagePattern({ cmd: 'getSurvey' })
    async getSurvey(data: any) {
        const { role, userId } = data.user;
        if(role === "admin") {
            return await this.surveyService.getFullSurvey(data.surveyId, ['fields', 'fields.answers', 'fields.choices', 'organization']);
        } else {
            const survey = await this.surveyService.getFullSurveyAssignToUser(userId, data.surveyId);
            if(!survey || !survey.isPublic) {
                throw new RpcException(new NotFoundException({
                    en: "Survey not found!",
                    fr: "Formulaire non trouvé !"
                }));
            }
            else return survey;
        }
    }

    @UseGuards(IsAdminGuard, SurveyExistGuard)
    @MessagePattern({ cmd: 'clone-survey' })
    cloneSurvey(@Param('surveyId') surveyId: number) {
        return this.surveyService.cloneSurvey(surveyId);
    }

    @UseGuards(IsAdminGuard)
    @MessagePattern({ cmd: 'create-survey' })
    createSurvey(data: {creationInformation: CreateSurveyDto}) {
        return this.surveyService.createSurvey(data.creationInformation);
    }

    @UseGuards(IsAdminGuard, SurveyExistGuard, SurveyIsNotAlreadyPublished, IsValidSelectMenu)
    @MessagePattern({ cmd: 'create-field' })
    createField(data: { fieldInformation: CreateFieldDto, surveyId: string }) {
        return this.surveyService.createField(+data.surveyId, data.fieldInformation);
    }

    @UseGuards(IsAdminGuard, SurveyExistGuard)
    @MessagePattern({ cmd: "delete-survey" })
    async deleteSurvey(data: { surveyId: string }) {
        await this.surveyService.deleteSurvey(+data.surveyId);
        return { success: true };
    }

    @UseGuards(IsAdminGuard, SurveyExistGuard, FieldExistGuard, SurveyIsNotAlreadyPublished)
    @MessagePattern({ cmd: 'delete-field' })
    async deleteField(data: { fieldId: string }) {
        await this.surveyService.deleteField(+data.fieldId);
        return { success: true };
    }

    @UseGuards(IsAdminGuard, SurveyExistGuard, SurveyIsNotAlreadyPublished, SurveyMustContainsFieldsToBePublished)
    @MessagePattern({ cmd: 'update-survey' })
    async updateSurvey(data: { surveyId: number, modificationInformations: UpdateSurveyDto, survey: Form }) {
        const { surveyId, modificationInformations, survey } = data;
        try {
            await this.surveyService.updateForm(surveyId, modificationInformations);
            const students = survey.organization.users.filter(user => user.user.role === UserRoles.STUDENT);
            if(modificationInformations.isPublic && students && students.length > 0) {
                await this.surveyService.sendNotifications(students, surveyId);
            }
            return this.surveyService.getFullSurvey(surveyId, ['fields', 'fields.answers', 'fields.choices', 'organization']);
        } catch (err) {
            console.error(err);
            throw new RpcException(new InternalServerErrorException())
        }
    }

    @UseGuards(IsAdminGuard, SurveyExistGuard, FieldExistGuard, SurveyIsNotAlreadyPublished, IsValidSelectMenu)
    @MessagePattern({ cmd: 'update-field' })
    async updateField(data: { fieldId: string, fieldInformation: UpdateFieldDto }) {
        const { fieldId, fieldInformation } = data;
        await this.surveyService.updateField(+fieldId, fieldInformation);
        return { success: true }
    }
}