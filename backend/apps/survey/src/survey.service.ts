import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Form, FormField, FormFieldSelectChoices, OrganizationUser, CreateFieldDto, CreateSurveyDto } from '@common';
import { NotificationsService } from '@app/notifications';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class SurveyService {
	constructor(
		@InjectRepository(FormField) private formFieldRepository: Repository<FormField>,
		@InjectRepository(Form) private formRepository: Repository<Form>,
		@InjectRepository(FormFieldSelectChoices) private formFieldSelectChoicesRepository: Repository<FormFieldSelectChoices>,
		private readonly notificationService: NotificationsService,
	) { }

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

	async getFilledSurveyAssignedToStudent(userId: number) {
		const forms = await this.getFilledSurveyAssignToUser(userId);
		return this.categorizeSurveysByCompletion(forms);
	}

	async getFilledSurveyAssignToUser(userId: number) {
		const surveys = await this.formRepository
			.createQueryBuilder('form')
			.innerJoin('organization_user', 'ou', 'form.organizationId = ou.organizationId')
			.leftJoinAndSelect('form.organization', 'organization')
			.leftJoinAndSelect('form.fields', 'field')
			.leftJoinAndSelect('field.answers', 'answer', 'answer.userId = :userId', { userId })
			.where('ou.userId = :userId', { userId })
			.andWhere('form.isPublic = 1')
			.select([
				'form.id',
				'form.title',
				'form.description',
				'form.organizationId',
				'organization.id',
				'organization.name',
				'field.id',
				'field.label',
				'field.fieldType',
				'answer.id',
				'answer.value',
				'answer.valueText',
				'answer.userId',
			])
			.getMany();

		return surveys;
	}

	async getFullSurveyAssignToUser(userId: string, surveyId: number) {
		const survey = await this.formRepository
			.createQueryBuilder('form')
			.innerJoin('organization_user', 'ou', 'form.organizationId = ou.organizationId')
			.leftJoinAndSelect('form.fields', 'fields')
			.leftJoinAndSelect('fields.choices', 'choices')
			.where('ou.userId = :userId', { userId })
			.andWhere('form.id = :surveyId', { surveyId })
			.getOne();
		return survey;
	}

	async getAllSurveys(): Promise<Form[]> {
		return await this.formRepository.find({ relations: ["organization"] });
	}

	async updatePublishmentStatusForSurvey(surveyId: number, isPublic: boolean): Promise<void> {
		await this.formRepository.update(surveyId, { isPublic });
	}

	async getFullSurvey(surveyId: number, relations: string[] = []): Promise<Form> {
		const form = await this.formRepository.findOne({ where: { id: surveyId }, relations });
		return form;
	}

	categorizeSurveysByCompletion(surveys: Form[]) {
		const surveyToFill = [];
		const filledSurvey = [];

		surveys.forEach((survey) => {
			const isFilled = survey.fields.some(field => field.answers.length > 0);
			if (isFilled) filledSurvey.push(survey);
			else surveyToFill.push(survey);
		})

		return { surveyToFill, filledSurvey };
	}

	async createSurvey(creationInformation: CreateSurveyDto): Promise<Form> {
		try {
			const newForm = await this.formRepository.save({ ...creationInformation, isPublic: false, fields: [] });
			return newForm;
		} catch {
			throw new RpcException(new BadRequestException());
		}
	}

	async createField(surveyId: number, creationInformations: CreateFieldDto): Promise<FormField> {
		return await this.formFieldRepository.save({ answers: [], ...creationInformations, formId: surveyId, choices: [] });
	}

	async deleteSurvey(surveyId: number): Promise<void> {
		await this.formRepository.delete(surveyId);
	}

	async deleteField(fieldId: number): Promise<void> {
		const field = await this.formFieldRepository.findOne({
			where: { id: fieldId },
		});

		if (!field) {
			throw new RpcException(new NotFoundException({
				en: `Field with id ${fieldId} not found!`,
				fr: `Le champ avec l'ID ${fieldId} n'a pas été trouvé !`
			}));
		}

		await this.formFieldRepository.delete(fieldId);
	}

	async sendNotifications(user: OrganizationUser[], surveyId: number) {
		this.notificationService.sendMailForAlertNewSurveyReleased(user.map(user => user.user.email), surveyId)
	}

	async updateForm(surveyId: number, modificationInformations: CreateSurveyDto) {
		await this.formRepository.update(surveyId, modificationInformations);
	}

	async updateField(fieldId: number, modificationInformations: any) {
		const { choices, ...fieldData } = modificationInformations;

		await this.formFieldRepository.update(fieldId, fieldData);

		const field = await this.formFieldRepository.findOne({
			where: { id: fieldId },
			relations: ['choices'],
		});

		if (field) {
			await this.formFieldSelectChoicesRepository.delete({ formFieldId: fieldId });

			if (choices && choices.length > 0) {
				const newChoices = choices.map(choice => {
					return this.formFieldSelectChoicesRepository.create({
						label: choice.label,
						formFieldId: fieldId,
					});
				});

				await this.formFieldSelectChoicesRepository.save(newChoices);
			}
		}
	}

	async cloneSurvey(surveyId: number) {
		const survey = await this.formRepository.findOne({
			where: { id: surveyId },
			relations: ['fields', 'fields.choices'],
		});

		if (!survey) {
			throw new RpcException(new NotFoundException({
				en: `Survey not found.`,
				fr: `Formulaire non trouvé.`
			}));
		}

		const clonedSurvey = await this.formRepository.save({
			title: survey.title,
			description: survey.description,
			isPublic: false,
			organizationId: survey.organizationId
		});

		for (const field of survey.fields) {
			const clonedField = this.formFieldRepository.create({
				label: field.label,
				fieldType: field.fieldType,
				required: field.required,
				order: field.order,
				maximalNumberOfChoices: field.maximalNumberOfChoices,
				formId: clonedSurvey.id,
			});

			await this.formFieldRepository.save(clonedField);

			for (const choice of field.choices) {
				const clonedChoice = this.formFieldSelectChoicesRepository.create({
					label: choice.label,
					formFieldId: clonedField.id,
				});

				await this.formFieldSelectChoicesRepository.save(clonedChoice);
			}
		}

		return this.getFullSurvey(clonedSurvey.id, ['fields', 'fields.answers', 'fields.choices', 'organization']);
	}
}