import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Answer, NotificationsInformations, Survey, SurveyField, SurveyFieldType, User } from "../utils/types";
import { useSelector } from "react-redux";
import InputField from "../components/SiteGlobalInput";
import SiteCheckbox from "../components/SiteCheckbox";
import SiteSelect from "../components/SiteSelect";
import { convertFieldTypeToInputType, handleErrorInFetchRequest, sendOrderedFields } from "../utils/utils";
import Notification, { NotificationRef } from "../components/SiteNotifications";
import { useTranslation } from "react-i18next";
import { XCircleIcon } from "@heroicons/react/24/outline";

const FillForm = () => {
    const { i18n, t } = useTranslation();
    const { id } = useParams<{ id: string; }>();
    const [form, setForm] = useState<Survey | undefined>(undefined);
    const [answers, setAnswers] = useState<Answer[] | undefined>(undefined);
    const API_URL = import.meta.env.VITE_API_URL;
    const [isAnswersAccessibleByAdmin, setIsAnswersAccessibleByAdmin] = useState<boolean>(false);
    const userLoggedIn = useSelector((state: any) => state.user.user) as User;
    const accessToken = userLoggedIn.accessToken;
    const navigate = useNavigate();

    // Notifications
    const emptyNotificationsInformations: NotificationsInformations = { informations: "", title: "" };
    const [notificationInformations, setNotificationInformations] = useState<NotificationsInformations>(emptyNotificationsInformations);
    const notificationRef = useRef<NotificationRef>(null);

    useEffect(() => {
        const getForm = async () => {
            // Fetch data
            const headers = { Authorization: 'Bearer ' + accessToken };
            const response = await fetch(API_URL + '/survey/' + id, { headers });
            if (!response.ok) {
                return handleErrorInFetchRequest(response, setNotificationInformations, notificationRef, i18n.language as "fr" | "en", t);
            }

            const data = await response.json();
            data.fields = sendOrderedFields(data.fields);
            setForm(data);
            setAnswers(() => data.fields.map((field: SurveyField) => ({ questionId: field.id, value: '' })));
        }

        getForm().catch(() => navigate('/to-fill'));
    }, []);

    const updateAnswer = (index: number, newValue: any) => {
        setAnswers(prevAnswers => {
            // @ts-ignore
            const updatedAnswers = [...prevAnswers];
            updatedAnswers[index] = { ...updatedAnswers[index], value: newValue };
            return updatedAnswers;
        });
    }

    const submitAnswers = async () => {
        const requestOptions = {
            method: "POST",
            headers: { Authorization: 'Bearer ' + accessToken, "Content-Type": 'application/json' },
            body: JSON.stringify({ answers, acceptReview: isAnswersAccessibleByAdmin })
        };

        try {
            const response = await fetch(`${API_URL}/user-answer/${id}`, requestOptions);
            if (!response.ok) {
                return handleErrorInFetchRequest(response, setNotificationInformations, notificationRef, i18n.language as "fr" | "en", t);
            }

            navigate(`/form/${id}/review`)
        } catch (err) {
            console.error(err);
        }
    }

    return (
        <>
            <div className="relative min-h-screen">
                {form && (
                    <div className="sticky top-0 bg-gray-200 text-gray-900 p-4 shadow-xl z-10">
                        <h1 className="text-lg font-semibold text-center">{form.title}</h1>
                    </div>
                )}

                <div className="w-4/5 mx-auto mt-6 items-center">
                    <div className="grid gap-5">
                        {(form && answers && form.fields) ? (<>
                            {form.fields.map((field, index) => (<>
                                {(field.fieldType !== SurveyFieldType.CHECKBOX && field.fieldType !== SurveyFieldType.SELECT) ? <InputField
                                    id={"question-" + field.id}
                                    modelValue={answers[index].value}
                                    onUpdate={(e) => updateAnswer(index, e)}
                                    label={`
                                    ${field.label}
                                    ${field.fieldType === SurveyFieldType.NUMBER ? `(min. ${field.minValue}, max. ${field.maxValue})` : ''}
                                `}
                                    required={field.required}
                                    type={convertFieldTypeToInputType(field.fieldType)}
                                    placeholder={field.label}
                                    key={index}
                                /> : null}

                                {field.fieldType === SurveyFieldType.CHECKBOX ? <SiteCheckbox
                                    id={"question-" + field.id}
                                    onUpdate={(e) => updateAnswer(index, e)}
                                    label={field.label}
                                    modelValue={answers[index].value as boolean}
                                    key={index}
                                /> : null}

                                {field.fieldType === SurveyFieldType.SELECT ? <SiteSelect
                                    modelValue={answers[index].value}
                                    key={index}
                                    options={field.choices.map((choice) => ({ label: choice.label, id: choice.label }))}
                                    optionLabel="label"
                                    label={`${field.label} ${field.maximalNumberOfChoices > 1 ? `(max. ${field.maximalNumberOfChoices})` : ''}`}
                                    onUpdate={(e) => updateAnswer(index, e)}
                                    optionKey="id"
                                    multiple={true}
                                    nativeSelect={false}
                                    maxNumberOfChoices={field.maximalNumberOfChoices}
                                /> : null}
                            </>))}
                        </>) : null}
                    </div>

                    <div className="mt-5">
                        <SiteCheckbox
                            label={t("MakeDataAccessibleForTeacher")}
                            modelValue={isAnswersAccessibleByAdmin}
                            onUpdate={setIsAnswersAccessibleByAdmin}
                            id="accept-review"
                        />
                    </div>

                    <div className="flex justify-center pt-5">
                        <button
                            className="p-2 col-span-full px-7 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-200"
                            onClick={submitAnswers}
                        >
                            {t("SubmitAnswers")}
                        </button>
                    </div>
                </div>
            </div>

            <Notification
                ref={notificationRef}
                title={notificationInformations.title}
                information={notificationInformations.informations}
            >
                <XCircleIcon className="h-6 w-6 text-red-600" />
            </Notification>
        </>
    );
}

export default FillForm;
