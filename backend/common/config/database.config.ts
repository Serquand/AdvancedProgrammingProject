import { Form, FormField, User, Organization, OrganizationUser, FormFieldUserAnswer, RefreshToken, FormFieldSelectChoices, SurveyPersonnalReviewGranted } from "@common/schemas"

export const getDatabaseConfigFromEnv = (env: any) => {
    return {
        type: 'mysql' as const,
        host: env.DB_HOST,
        password: env.DB_PASSWORD,
        username: env.DB_USER,
        database: env.DB_NAME,
        port: env.DB_PORT,
        synchronize: true,
        entities: [Form, FormField, User, Organization, OrganizationUser, FormFieldUserAnswer, RefreshToken, FormFieldSelectChoices, SurveyPersonnalReviewGranted]
    }
}