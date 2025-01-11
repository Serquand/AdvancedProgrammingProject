import { useEffect, useRef, useState } from "react";
import { NotificationsInformations, SurveyWithAnswer, User, UserWithoutAccessToken } from "../utils/types";
import { useParams } from "react-router-dom";
import SiteGlobalKPI from "../components/SiteGlobalKPI";
import { handleErrorInFetchRequest, sendOrderedFields } from "../utils/utils";
import CollapsibleSection from "../components/CollapsibleSection";
import { useSelector } from "react-redux";
import Notification, { NotificationRef } from "../components/SiteNotifications";
import { useTranslation } from "react-i18next";
import { XCircleIcon } from "@heroicons/react/24/outline";
import SiteSelect from "../components/SiteSelect";
import SurveyResponseViewer from "../components/SurveyResponseViewer";

const AnswersPage = () => {
    const { i18n, t } = useTranslation();
    const [answers, setAnswers] = useState<SurveyWithAnswer | undefined>(undefined);
    const API_URL = import.meta.env.VITE_API_URL;
    const userLoggedIn = useSelector((state: any) => state.user.user) as User;
    const accessToken = userLoggedIn.accessToken;
    const { id } = useParams<{ id: string; }>();
    const [respondents, setRespondents] = useState<{ respondent: string; id: number }[] | undefined>(undefined);
    const [viewMode, setViewMode] = useState<"general" | "byUser">("general");
    const [selectedRespondentId, setSelectedRespondentId] = useState<number>(0);
    const [personnalAnswers, setPersonnalAnswers] = useState<SurveyWithAnswer | undefined>(undefined);

    // Notifications
    const emptyNotificationsInformations: NotificationsInformations = { informations: "", title: "" };
    const [notificationInformations, setNotificationInformations] = useState<NotificationsInformations>(emptyNotificationsInformations);
    const notificationRef = useRef<NotificationRef>(null);

    const getRespondents = async () => {
        const headers = { Authorization: 'Bearer ' + accessToken };
        const response = await fetch(`${API_URL}/user-answer/${id}/list-respondents`, { headers });
        if (!response.ok) {
            return handleErrorInFetchRequest(response, setNotificationInformations, notificationRef, i18n.language as "fr" | "en", t);
        }

        const data = await response.json() as UserWithoutAccessToken[];
        const respondents = data.map(r => ({
            respondent: `${r.firstName} ${r.lastName.toUpperCase()} (${r.email})`,
            id: r.id
        }));
        setRespondents(respondents);
        respondents.length > 0 && setSelectedRespondentId(respondents[0].id);
    }

    const getUserAnswers = async () => {
        const headers = { Authorization: 'Bearer ' + accessToken };
        const response = await fetch(`${API_URL}/user-answer/${id}`, { headers });
        if (!response.ok) {
            return handleErrorInFetchRequest(response, setNotificationInformations, notificationRef, i18n.language as "fr" | "en", t);
        }

        const data = await response.json();
        data.fields = sendOrderedFields(data.fields);
        setAnswers(data);
    }

    const getPersonnalUser = async () => {
        const headers = { Authorization: 'Bearer ' + accessToken };
        const response = await fetch(`${API_URL}/user-answer/${id}/${selectedRespondentId}`, { headers });
        if (!response.ok) {
            return handleErrorInFetchRequest(response, setNotificationInformations, notificationRef, i18n.language as "fr" | "en", t);
        }

        const data = await response.json();
        setPersonnalAnswers(data);
    }

    useEffect(() => {
        getUserAnswers();
        getRespondents();
    }, []);

    useEffect(() => {
        if(!selectedRespondentId) return;
        getPersonnalUser()
    }, [selectedRespondentId]);

    if (!answers) return;

    return (<>
        <div className="sticky top-0 bg-gray-200 text-gray-900 p-4 shadow-xl z-10">
            <h1 className="text-lg font-semibold text-center">{answers.title}</h1>
        </div>

        <div className="p-6">
            <div className="flex w-fit mx-auto justify-center mb-4 relative">
                <button
                    className="w-40 pb-2 text-lg"
                    onClick={() => setViewMode("general")}
                >
                    {t("General")}
                </button>

                <button
                    className="w-40 pb-2 text-lg"
                    onClick={() => setViewMode("byUser")}
                >
                    {`${t("ByUser")} (${respondents?.length})`}
                </button>

                <div className={`h-1 w-40 transition-all bg-gray-900 absolute rounded-t-2xl bottom-0 ${viewMode === 'general' ? 'left-0' : 'left-1/2'}`} />
            </div>

            {viewMode === 'general' && <div className="flex flex-col gap-6">
                {answers.fields.map((field) => (
                    <div className=" w-full mx-auto">
                        <CollapsibleSection title={field.label}>
                            <SiteGlobalKPI
                                maxValue={field.maxValue}
                                minValue={field.minValue}
                                answers={field.answers.map((answer) => ({ questionId: answer.id, value: answer.value, valueText: answer.valueText }))}
                                fieldType={field.fieldType}
                                label={field.label}
                            />
                        </CollapsibleSection>
                    </div>
                ))}
            </div>}

            {viewMode === 'byUser' && respondents && respondents.length > 0 && <div>
                <SiteSelect
                    modelValue={selectedRespondentId}
                    options={respondents}
                    onUpdate={setSelectedRespondentId}
                    disabled={false}
                    optionLabel="respondent"
                    optionKey="id"
                    label={t("user")}
                />

                <div className="px-6 mt-5">
                    {personnalAnswers && <SurveyResponseViewer form={personnalAnswers} />}
                </div>
            </div>}

            {viewMode === 'byUser' && respondents && !respondents.length && <p className="h-screen flex items-center justify-center text-xl">{t("NoRespondent")}</p>}
        </div>

        <Notification
            ref={notificationRef}
            title={notificationInformations.title}
            information={notificationInformations.informations}
        >
            <XCircleIcon className="h-6 w-6 text-red-600" />
        </Notification>
    </>)
}

export default AnswersPage;