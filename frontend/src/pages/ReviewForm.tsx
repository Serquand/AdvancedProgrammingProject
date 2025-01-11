import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { NotificationsInformations, SurveyWithAnswer, User } from "../utils/types";
import { handleErrorInFetchRequest, sendOrderedFields } from "../utils/utils";
import { useSelector } from "react-redux";
import Notification, { NotificationRef } from "../components/SiteNotifications";
import { useTranslation } from "react-i18next";
import { XCircleIcon } from "@heroicons/react/24/outline";
import SurveyResponseViewer from "../components/SurveyResponseViewer";

const ReviewForm = () => {
    const { t, i18n } = useTranslation();
    const { id: formId } = useParams<{ id: string; }>();
    const [form, setForm] = useState<SurveyWithAnswer | undefined>(undefined);
    const API_URL = import.meta.env.VITE_API_URL;
    const user = useSelector((state: any) => state.user.user) as User;
    const accessToken = user.accessToken;

    // Notifications
    const emptyNotificationsInformations: NotificationsInformations = { informations: "", title: "" };
    const [notificationInformations, setNotificationInformations] = useState<NotificationsInformations>(emptyNotificationsInformations);
    const notificationRef = useRef<NotificationRef>(null);

    useEffect(() => {
        const getAnswers = async () => {
            const headers = { Authorization: 'Bearer ' + accessToken }
            const response = await fetch(`${API_URL}/user-answer/${formId}`, { headers });
            if (!response.ok) {
                return handleErrorInFetchRequest(response, setNotificationInformations, notificationRef, i18n.language as "fr" | "en", t);
            }
            const data = await response.json();
            data.fields = sendOrderedFields(data.fields);
            setForm(data);
        }
        getAnswers();
    }, []);

    return (<>
        <div className="relative min-h-screen">
            {form && (
                <div className="sticky top-0 bg-gray-200 text-gray-900 p-4 shadow-xl z-10">
                    <h1 className="text-lg font-semibold text-center">{form.title}</h1>
                </div>
            )}

            <div className="w-4/5 mx-auto mt-6 items-center">
                {form && <SurveyResponseViewer form={form} />}
            </div>
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

export default ReviewForm;