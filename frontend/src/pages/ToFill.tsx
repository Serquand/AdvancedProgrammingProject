import { useEffect, useRef, useState } from "react";
import { NotificationsInformations, SurveyPreview, User } from "../utils/types";
import ListPreviewForm from "../components/ListPreviewForm";
import { useSelector } from "react-redux";
import { handleErrorInFetchRequest } from "../utils/utils";
import { XCircleIcon } from "@heroicons/react/24/outline";
import Notification, { NotificationRef } from "../components/SiteNotifications";
import { useTranslation } from "react-i18next";

const ToFillPage = () => {
    const { t, i18n } = useTranslation();
    const [surveys, setSurveyData] = useState<SurveyPreview[] | null>(null);
    const API_URL = import.meta.env.VITE_API_URL;
    const userLoggedIn = useSelector((state: any) => state.user.user) as User;
    const accessToken = userLoggedIn.accessToken;

    // Notifications
    const emptyNotificationsInformations: NotificationsInformations = { informations: "", title: "" };
    const [notificationInformations, setNotificationInformations] = useState<NotificationsInformations>(emptyNotificationsInformations);
    const notificationRef = useRef<NotificationRef>(null);

    useEffect(() => {
        const fetchSurveyData = async () => {
            const headers = { Authorization: "Bearer " + accessToken };
            const response = await fetch(API_URL + "/survey", { headers });
            if (!response.ok) {
                return handleErrorInFetchRequest(response, setNotificationInformations, notificationRef, i18n.language as "fr" | "en", t);
            }

            const data = await response.json();
            setSurveyData(data.surveyToFill);
        };

        fetchSurveyData();
    }, []);

    return (
        <>
            <div>
                {surveys ?
                    <ListPreviewForm
                        canDelete={false}
                        surveys={surveys}
                        mustShowPublicationStatus={false}
                    />
                    : null}
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
};

export default ToFillPage;