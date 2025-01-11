import { Form, FormField, FormFieldSelectChoices } from '@common';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class SurveyLibService {
    constructor(@InjectRepository(Form) private formRepository: Repository<Form>) { }

    async getFullSurvey(surveyId: number, relations: string[] = []): Promise<Form> {
		const form = await this.formRepository.findOne({ where: { id: surveyId }, relations });
		return form;
	}

    async getSurveyAssignToUser(userId: number) {
		const surveys = await this.formRepository
			.createQueryBuilder('form')
			.innerJoin('organization_user', 'ou', 'form.organizationId = ou.organizationId')
			.leftJoinAndSelect('form.organization', 'organization')
			.where('ou.userId = :userId', { userId })
			.andWhere('form.isPublic = 1')
			.select(['form.id', 'form.title', 'form.description', 'organization.name'])
			.getMany();

		return surveys;
	}
}
