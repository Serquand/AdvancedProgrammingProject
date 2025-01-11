import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class NotificationsService {
	private async sendMail(mailInformation: nodemailer.SendMailOptions) {
		const transporter = nodemailer.createTransport({
			service: process.env.SERVICE_MAIL,
			auth: {
				user: process.env.USER_MAIL,
				pass: process.env.PASS_MAIL,
			},
			tls: {
				rejectUnauthorized: false,
			},
			debug: true,
			secure: false,
		});

		try {
			await transporter.sendMail(mailInformation);
		} catch {
			throw new Error('Something went wrong whens sending email');
		}
	}

	async sendMailForRetrievePassword(lastName: string, firstName: string, tokenRetrievePassword: string, emailToSend: string) {
		const mailOptions: nodemailer.SendMailOptions = {
			subject: 'Votre demande de changement de mot de passe',
			text: `Bonjour ${firstName + " " + lastName},\n\n` +
				`Vous avez effectué une demande de réinitialisation de mot de passe. Pour continuer, merci de suivre la procédure accessible par le lien suivant:\n` +
				`${process.env.FRONT_END_BASIS_URL}/retrieve-password?token=${tokenRetrievePassword}.\n` +
				`Si vous n'avez pas initié cette demande, prière d'ignorer ce message.\n\n` +
				`Cordialement,\n` +
				`Surv'EFREI`
			,
			to: emailToSend
		};

		await this.sendMail(mailOptions)
	}

	async sendMailForAlertNewSurveyReleased(studentEmailList: string[], surveyId: number) {
		const mailOptions: nodemailer.SendMailOptions = {
			subject: 'Nouveau formulaire',
			bcc: studentEmailList,
			text: "Bonjour,\n\n" +
				`Un nouveau questionnaire vous concernant est disponible :\n` +
				`${process.env.FRONT_END_BASIS_URL}/form/${surveyId}/fill.\n\n` +
				"Cordialement,\n" +
				"Surv'Efrei"
		};

		await this.sendMail(mailOptions)
	}
}