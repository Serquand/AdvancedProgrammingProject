import { BadRequestException, CanActivate, ExecutionContext, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { FieldType, Form, FormField } from '@common';
import { RpcException } from '@nestjs/microservices';
import { Observable } from 'rxjs';

@Injectable()
export class FieldExistGuard implements CanActivate {
    async canActivate(context: ExecutionContext) {
        const data = context.switchToRpc().getData();
        const fieldId = +data.fieldId;
        const survey = data.survey as Form;
        if (!survey) throw new RpcException(new InternalServerErrorException("Something went wrong !"));

        const field = survey.fields.find(f => f.id === fieldId);
        if (!field) {
            throw new RpcException(new NotFoundException({
                en: "Field not found !",
                fr: "Le champ n'a pas été trouvé !"
            }));
        }
        return true;
    }
}

export class SurveyIsNotAlreadyPublished implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const data = context.switchToRpc().getData();
        const survey = data.survey as Form;
        if(survey.isPublic) {
            throw new RpcException(new BadRequestException({
                en: "The survey is already public so cannot be updated !",
                fr: "Le formulaire est déjà publié et ne peut pas être modifié !"
            }));
        }
        return true;
    }
}

export class SurveyMustContainsFieldsToBePublished implements CanActivate {
    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const data = context.switchToRpc().getData();
        const modificationInformations = data.modificationInformations;
        const survey = data.survey as Form;

        if(!modificationInformations.isPublic) {
            return true;
        }

        if(!(survey && survey.fields && survey.fields.length > 0)) {
            throw new RpcException(new BadRequestException({
                en: "The survey must at least contains 1 field to be published!",
                fr: "Le formulaire doit au moins contenir 1 champ pour pouvoir être publié !",
            }));
        }
        return true;
    }
}

export class IsValidSelectMenu implements CanActivate {
    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const data = context.switchToRpc().getData();
        const field = data.fieldInformation as FormField;

        if (field.fieldType !== FieldType.SELECT) return true;

        if (!field.choices || field.choices.length === 0) {
            throw new RpcException(new BadRequestException({
                en: 'Select field must have at least one choice.',
                fr: "Les listes déroulantes doivent avoir au moins un choix."
            }));
        }

        if (!field.maximalNumberOfChoices || field.maximalNumberOfChoices <= 0 || field.maximalNumberOfChoices > field.choices.length) {
            throw new RpcException(new BadRequestException({
                en: 'The number of choices must be between 1 and the maximal number of answers.',
                fr: "Le nombre de choix doit être compris entre 1 et le nombre maximal de réponses."
            }));
        }

        return true;
    }
}