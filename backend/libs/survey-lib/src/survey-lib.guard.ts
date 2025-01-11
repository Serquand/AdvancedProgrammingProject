import { Form } from "@common";
import { ExecutionContext, Injectable, NotFoundException } from "@nestjs/common";
import { RpcException } from "@nestjs/microservices";
import { SurveyLibService } from "./survey-lib.service";

@Injectable()
export class SurveyExistGuard {
    constructor(private surveyService: SurveyLibService) { }

    async canActivate(context: ExecutionContext): Promise<boolean | Form> {
        const data = context.switchToRpc().getData();
        const surveyId = +data.surveyId;
        if (Number.isNaN(surveyId)) {
            throw new RpcException(new NotFoundException({
                en: "Survey not found !",
                fr: "Formulaire non trouvé !"
            }));
        }

        const survey = await this.surveyService.getFullSurvey(surveyId, ['fields', 'fields.choices', 'fields.answers', 'organization', 'organization.users']);
        if (!survey) {
            throw new RpcException(new NotFoundException({
                en: "Survey not found !",
                fr: "Formulaire non trouvé !"
            }));
        }

        data.survey = survey;
        return true;
    }
}