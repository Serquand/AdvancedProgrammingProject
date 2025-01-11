import { useNavigate, useSearchParams } from 'react-router-dom';
import InputField from "../components/SiteGlobalInput";
import { RetrievePassword } from '../utils/types';
import { useRef, useState } from 'react';
import Notification, { NotificationRef } from "../components/SiteNotifications";
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

const RetrievePasswordPage = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const [notificationTitle, setNotificationTitle] = useState("");
    const [notificationInformations, setNotificationInformations] = useState("");
    const [notificationsSuccess, setNotificationsSuccess] = useState<boolean>(false);
    const [retrievePasswordInformations, setRetrievePasswordInformations] = useState<RetrievePassword>({
        email: "",
        password: "",
        token: token as string,
    });
    const notificationRef = useRef<NotificationRef>(null);
    const navigate = useNavigate();

    if (!token) return null;


    const updateInformations = (key: keyof RetrievePassword, newValue: string) => {
        const newInformations = { ...retrievePasswordInformations, [key]: newValue };
        setRetrievePasswordInformations(newInformations);
    }

    const showNotification = () => {
        if (notificationRef.current) {
            notificationRef.current.openNotifications();
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const API_URL = import.meta.env.VITE_API_URL;
            const requestOptions = {
                method: "POST",
                body: JSON.stringify(retrievePasswordInformations),
                headers: { "Content-Type": "application/json" }
            };
            const response = await fetch(API_URL + '/auth/reset-password', requestOptions);
            if (!response.ok) throw new Error();

            setNotificationTitle("Succès");
            setNotificationInformations("Le mot de passe a été réinitialisé avec succès");
            setNotificationsSuccess(true);

            setInterval(() => navigate("/"), 2_000);
        } catch (err) {
            setNotificationTitle("Erreur");
            setNotificationInformations("Something went wrong when trying to update the password");
            setNotificationsSuccess(false);
        } finally {
            showNotification();
        }
    }

    return (
        <>
            <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
                <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                    <img
                        className="mx-auto h-14 w-auto"
                        src="/Logo SurvEfrei.png"
                        alt="Your Company"
                    />

                    <h2 className="mt-10 text-center text-2xl/9 font-bold tracking-tight text-gray-900">
                        Reset your password
                    </h2>
                </div>

                <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
                    <form
                        className="space-y-6"
                        method="POST"
                        onSubmit={handleSubmit}
                    >
                        <InputField
                            id='reset-password-email'
                            modelValue={retrievePasswordInformations.email}
                            label='Email address'
                            required={true}
                            onUpdate={e => updateInformations('email', e as string)}
                            placeholder='Your email address'
                        />

                        <InputField
                            id='reset-password-password'
                            modelValue={retrievePasswordInformations.password}
                            label='Password'
                            required={true}
                            onUpdate={e => updateInformations('password', e as string)}
                            placeholder='Your new password'
                        />

                        <div>
                            <button
                                type="submit"
                                className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                            >
                                Reset password
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <Notification
                ref={notificationRef}
                title={notificationTitle}
                information={notificationInformations}
            >
                {notificationsSuccess ?
                    <CheckCircleIcon className="h-6 w-6 text-green-600" /> :
                    <XCircleIcon className="h-6 w-6 text-red-600" />
                }
            </Notification>
        </>
    )
}

export default RetrievePasswordPage;