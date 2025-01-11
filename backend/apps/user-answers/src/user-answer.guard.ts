import { BadRequestException, CanActivate, ConflictException, ExecutionContext, ForbiddenException, Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { AnswerDTO, FieldType, FormField, UserRoles } from "@common";
import { isArray, isBoolean, isEmpty, isNumber, isString } from "class-validator";
import { UserAnswerService } from "./user-answer.service";
import { RpcException } from "@nestjs/microservices";
import { Observable } from "rxjs";
import { SurveyLibService } from "@app/survey-lib";

@Injectable()
export class CheckAnswersFormat {
    checkAnswerType(question: FormField, userAnswer: AnswerDTO) {
        if (!question.required && isEmpty(userAnswer.value)) return true;

        switch (question.fieldType) {
            case FieldType.CHECKBOX:
                return isBoolean(userAnswer.value);

            case FieldType.NUMBER:
                return isNumber(userAnswer.value) && userAnswer.value >= question.minValue && userAnswer.value <= question.maxValue;

            case FieldType.SELECT:
                if (!isArray(userAnswer.value)) return false;
                if (userAnswer.value.length === 0 || userAnswer.value.length > question.maximalNumberOfChoices) return false;
                return userAnswer.value.every(value => question.choices.filter((choice => choice.label === value)).length > 0);

            case FieldType.TEXT:
            case FieldType.TEXTAREA:
                return isString(userAnswer.value);

            default:
                return false;
        }
    }

    checkAnswers(userAnswers: Array<AnswerDTO>, surveyQuestions: Array<FormField>): boolean {
        if (userAnswers.length !== surveyQuestions.length) {
            return false;
        };

        for (const question of surveyQuestions) {
            const answer = userAnswers.find(a => a.questionId === question.id);
            if (!answer || !this.checkAnswerType(question, answer)) {
                return false;
            }
        }

        return true;
    }

    async canActivate(context: ExecutionContext) {
        const data = context.switchToRpc().getData();
        const survey = data.survey;
        const answers = data.answers;

        if (this.checkAnswers(answers, survey.fields)) return true;
        throw new RpcException(new BadRequestException({
            en: "Answers not valid!",
            fr: "Les réponses ne sont pas valides !",
        }));
    }
}

@Injectable()
export class HasStudentAlreadyAnswerGuard implements CanActivate {
    constructor(private answerService: UserAnswerService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const { userId } = request.user;
        const { id: surveyId } = request.survey;
        const userAnswers = await this.answerService.getSurveyAnswerForStudent(surveyId, userId);

        if (isArray(userAnswers) && userAnswers.length === 0) return true;
        throw new RpcException(new ConflictException({
            en: "You have already answered this survey!",
            fr: "Vous avez déjà répondu à ce formulaire !",
        }));
    }
}

@Injectable()
export class IsSurveyPublicGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const data = context.switchToRpc().getData();
        const survey = data.survey;
        if (survey.isPublic) return true;
        throw new RpcException(new NotFoundException({ en: "Survey not found!", fr: "Formulaire non trouvé !" }));
    }
}

@Injectable()
export class CanAccessGlobalSurveyAnswer implements CanActivate {
    constructor(private surveyLibService: SurveyLibService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const data = context.switchToRpc().getData();
        const { userId, role } = data.user;
        if (role === UserRoles.STUDENT) throw new RpcException(new ForbiddenException());
        else if (role === UserRoles.TEACHER) {
            const isUserAssignedToSurvey = (await this.surveyLibService
                .getFullSurvey(data.surveyId, ["organization", "organization.users", "organization.users.user"]))
                .organization.users.find(user => user.user.id === userId);

            if (!isUserAssignedToSurvey) {
                throw new RpcException(new ForbiddenException());
            }
        }

        return true;
    }
}