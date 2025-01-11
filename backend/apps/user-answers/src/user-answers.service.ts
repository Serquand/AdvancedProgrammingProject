import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Form, SubmitAnswersDTO, FormFieldUserAnswer } from '@common'
import { isString } from 'class-validator';

@Injectable()
export class UserAnswerService {
    constructor(
        @InjectRepository(FormFieldUserAnswer)
        private answerRepository: Repository<FormFieldUserAnswer>,

        @InjectRepository(Form)
        private formRepository: Repository<Form>,
    ) { }

    async savedUserAnswers(answersInformation: SubmitAnswersDTO, userId: number) {
        const answersToSave = answersInformation.answers.map((answer) => {
            const answerToSave = new FormFieldUserAnswer();
            answerToSave.fieldId = answer.questionId;
            answerToSave.userId = userId;
            answerToSave.value = isString(answer.value) ? null : answer.value;
            answerToSave.valueText = isString(answer.value) ? answer.value : null;
            return answerToSave;
        });
        await this.answerRepository.save(answersToSave);
    }

    getSurveyAnswersBase(surveyId: number) {
        const queryBuilder = this.formRepository
            .createQueryBuilder("form")
            .leftJoinAndSelect("form.fields", "field")
            .leftJoinAndSelect("field.answers", "answer")
            .leftJoinAndSelect("field.choices", "choice")
            .select([
                "form.title",
                "form.description",
                "field.label",
                "field.fieldType",
                "field.id",
                "field.order",
                "field.required",
                "field.minValue",
                "field.maxValue",
                "choice",
                "answer.value",
                "answer.valueText",
                "answer.id",
                "form.organizationId"
            ])
            .where("form.id = :surveyId", { surveyId });

        return queryBuilder
    }

    async getSurveyAnswersForAdmin(surveyId: number) {
        return await this
            .getSurveyAnswersBase(surveyId)
            .getOne() ?? [];
    }

    async getSurveyAnswerForStudent(surveyId: number, studentId: number) {
        return await this
            .getSurveyAnswersBase(surveyId)
            .innerJoin("organization_user", "ou", "form.organizationId = ou.organizationId")
            .andWhere("ou.userId = :userId", { userId: studentId })
            .andWhere("answer.userId = :studentId", { studentId })
            .getOne() ?? [];
    }

    async getSurveyAnswerForTeacher(surveyId: number, teacherId: number) {
        return await this
            .getSurveyAnswersBase(surveyId)
            .innerJoin("organization_user", "ou", "form.organizationId = ou.organizationId")
            .andWhere("ou.userId = :userId", { userId: teacherId })
            .getOne() ?? [];
    }
}
