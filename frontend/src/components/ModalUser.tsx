import { useState, useEffect, useRef } from "react";
import { NotificationsInformations, User, UserWithoutAccessToken } from "../utils/types";
import InputField from "./SiteGlobalInput";
import SiteSelect from "./SiteSelect";
import { useSelector } from "react-redux";
import { useTranslation } from 'react-i18next';
import { handleErrorInFetchRequest } from "../utils/utils";
import { XCircleIcon } from "@heroicons/react/24/outline";
import Notification, { NotificationRef } from "./SiteNotifications";

export type CreateNewUSer = UserWithoutAccessToken & { password?: string; };

interface ModalUserProps {
    isOpen: boolean;
    onClose: () => void;
    user: Partial<CreateNewUSer>;
    onUpdateUser: (updatedUser: UserWithoutAccessToken) => void;
    mode: 'creation' | 'edition';
}

const ModalUser = ({ isOpen, onClose, user, onUpdateUser, mode }: ModalUserProps) => {
    const { t, i18n } = useTranslation();
    const [formData, setFormData] = useState<Partial<CreateNewUSer>>(user);
    const API_URL = import.meta.env.VITE_API_URL;
    const userLoggedIn = useSelector((state: any) => state.user.user) as User;
    const accessToken = userLoggedIn.accessToken;
    const roleOptions: { label: string; id: string }[] = [
        { id: 'student', label: `${t("Student")}` },
        { id: 'teacher', label: `${t("Teacher")}` },
        { id: 'admin', label: `${t("Admin")}` },
    ]

    // Notifications
    const emptyNotificationsInformations: NotificationsInformations = { informations: "", title: "" };
    const [notificationInformations, setNotificationInformations] = useState<NotificationsInformations>(emptyNotificationsInformations);
    const notificationRef = useRef<NotificationRef>(null);

    useEffect(() => {
        setFormData(user);
    }, [user]);

    const handleChange = (key: keyof CreateNewUSer, e: any) => {
        setFormData({ ...formData, [key]: e });
    };

    const sendUserRequest = async (url: string, method: string, data: object): Promise<false | UserWithoutAccessToken> => {
        try {
            const requestOptions = {
                body: JSON.stringify(data),
                method,
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
            };

            const response = await fetch(url, requestOptions);
            if (!response.ok) {
                handleErrorInFetchRequest(response, setNotificationInformations, notificationRef, i18n.language as "fr" | "en", t);
                return false;
            }

            return response.json();
        } catch (error) {
            console.error("An error occurred:", error);
            throw error;
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            if (mode === "creation") {
                const { id, ...dataToSend } = formData;
                const data = await sendUserRequest(`${API_URL}/user/register`, "POST", dataToSend);
                if(!data) throw new Error();
                onUpdateUser(data);
            } else if (mode === "edition") {
                // @ts-ignore
                const { id, password, email, fullName, ...dataToSend } = formData;
                const data = await sendUserRequest(`${API_URL}/user/${id}`, "PUT", dataToSend);
                if(!data) throw new Error();
                onUpdateUser(data);
            }
        } catch (error) {
            console.error("Error during submission:", error);
        }
    };

    return (
        <>
            {isOpen && (
                <div className="fixed w-screen inset-0 bg-gray-900/50 flex justify-center items-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-semibold">
                                {mode === 'creation' ? `${t("UserCreate")}` : `${t("UserModify")}`}
                            </h3>
                            <button
                                onClick={onClose}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                &times;
                            </button>
                        </div>

                        <div className="mt-4">
                            <form
                                onSubmit={handleSubmit}
                                className="flex flex-col sm:grid sm:grid-cols-2 gap-y-4 gap-x-12"
                            >
                                <InputField
                                    id="update-user-first-name"
                                    modelValue={formData.firstName}
                                    onUpdate={(e) => handleChange('firstName', e)}
                                    label={t("UserName")}
                                    placeholder={t("UserName")}
                                    required={true}
                                />

                                <InputField
                                    id="update-user-last-name"
                                    modelValue={formData.lastName}
                                    onUpdate={(e) => handleChange('lastName', e)}
                                    label={t("LastName")}
                                    placeholder={t("LastName")}
                                    required={true}
                                />

                                <InputField
                                    id="update-user-email"
                                    modelValue={formData.email}
                                    onUpdate={(e) => handleChange('email', e)}
                                    label={t("Mail")}
                                    placeholder={t("Mail")}
                                    required={true}
                                    disabled={mode === 'edition'}
                                />

                                <SiteSelect
                                    modelValue={formData.role}
                                    onUpdate={(e) => handleChange("role", e)}
                                    options={roleOptions}
                                    label={t("Role")}
                                    placeholder={t("Role")}
                                    required={true}
                                    optionLabel="label"
                                    optionKey="id"
                                />

                                {mode === 'creation' ? <InputField
                                    id="update-user-password"
                                    modelValue={formData.password}
                                    onUpdate={(e) => handleChange('password', e)}
                                    label={t("Password")}
                                    placeholder={t("Password")}
                                    required={true}
                                    type="password"
                                /> : null}

                                <div className="flex justify-end space-x-2 mt-4 sm:mt-auto col-span-2">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                                    >
                                        {t("Cancel")}
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                                    >
                                        {mode === 'creation' ? `${t("Create")}` : `${t("Update")}`}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

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

export default ModalUser;
