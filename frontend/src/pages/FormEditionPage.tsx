import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import SurveyFieldBuilder from "../components/SurveyFieldBuilder";
import { NotificationsInformations, Organization, Survey, SurveyField, User } from '../utils/types';
import InputField from "../components/SiteGlobalInput";
import { useSelector } from "react-redux";
import SiteCheckbox from "../components/SiteCheckbox";
import SiteSelect from "../components/SiteSelect";
import ConfirmationModal, { ConfirmationModalRef } from "../components/ConfirmationModal";
import { handleErrorInFetchRequest, moveElement, sendOrderedFields } from "../utils/utils";
import { useTranslation } from 'react-i18next';
import Notification, { NotificationRef } from "../components/SiteNotifications";
import { XCircleIcon } from "@heroicons/react/24/solid";

const FormEditionPage = () => {
    const { t, i18n } = useTranslation();
    const debounceTimeMs = 1_500;
    const { id } = useParams<{ id: string; }>();
    const [form, setForm] = useState<Survey | undefined>(undefined);
    const modalRef = useRef<ConfirmationModalRef>(null);
    const API_URL = import.meta.env.VITE_API_URL;
    const userLoggedIn = useSelector((state: any) => state.user.user) as User;
    const accessToken = userLoggedIn.accessToken;
    const [organizations, setOrganizations] = useState<Organization[] | undefined>(undefined);
    const [updatingKey, setUpdatingKey] = useState<number>(0);
    const navigate = useNavigate();
    const bottomRef = useRef<HTMLDivElement | null>(null);

    // Notifications
    const emptyNotificationsInformations: NotificationsInformations = { informations: "", title: "" };
    const [notificationInformations, setNotificationInformations] = useState<NotificationsInformations>(emptyNotificationsInformations);
    const notificationRef = useRef<NotificationRef>(null);

    // @ts-ignore
    const [saveTimeout, setSaveTimeout] = useState<NodeJS.Timeout | null>(null);

    const fieldsOrdered = useMemo(() => {
        if (!form || !form.fields) return [];
        setUpdatingKey(prev => prev + 1);
        return sendOrderedFields(form.fields);
    }, [form?.fields]);

    const onTriggerPublishButton = async (publishmentValue: boolean) => {
        if (modalRef.current) {
            const validateUserDeletion = await modalRef.current.openModal();
            if (validateUserDeletion) {
                const newForm = { ...form!, isPublic: publishmentValue };
                onValidatePublishment(newForm);
            }
        }
    }

    const onValidatePublishment = async (formToSave: Survey) => {
        if (saveTimeout) clearTimeout(saveTimeout);
        const success = await saveForm(formToSave);
        if (success) navigate('/forms')
    }

    const findMaxOrder = (): number => {
        if (!form || form.fields.length === 0) return 1;
        return Math.max(...form.fields.map(field => field.order));
    }

    const createNewField = async () => {
        const body = { fieldType: "TX", label: `${t("MyField")}`, order: findMaxOrder() + 1 };
        const requestOptions = {
            method: "POST",
            body: JSON.stringify(body),
            headers: {
                Authorization: 'Bearer ' + accessToken,
                "Content-Type": "application/json"
            }
        }
        const response = await fetch(`${API_URL}/survey/${id}/field`, requestOptions);
        const data = await response.json();
        if (!response.ok) {
            return handleErrorInFetchRequest(response, setNotificationInformations, notificationRef, i18n.language as "fr" | "en", t);
        }

        // @ts-ignore
        setForm(prevForm => {
            const newForm = { ...prevForm, fields: prevForm?.fields ? [...prevForm.fields, data] : [data] };
            return newForm;
        });

        if (bottomRef.current) {
            bottomRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }

    const saveForm = async (newForm: any): Promise<boolean> => {
        const { fields, organization, id, ...formToSave } = newForm;
        const requestOptions = {
            headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
            method: "PUT",
            body: JSON.stringify(formToSave),
        };
        const response = await fetch(`${API_URL}/survey/${id}`, requestOptions);
        if (!response.ok) {
            handleErrorInFetchRequest(response, setNotificationInformations, notificationRef, i18n.language as "fr" | "en", t);
        }
        return response.ok;
    }

    const setDebounceToSaveField = (newForm: any) => {
        if (saveTimeout) clearTimeout(saveTimeout);

        const timeout = setTimeout(() => saveForm(newForm), debounceTimeMs);
        setSaveTimeout(timeout);

        return () => {
            if (saveTimeout) clearTimeout(saveTimeout);
        };
    };

    const deleteField = (fieldId: number) => {
        // @ts-ignore
        setForm(prevForm => {
            const newForm = { ...prevForm, fields: prevForm?.fields.filter((field) => field.id !== fieldId) };
            setDebounceToSaveField(newForm);
            return newForm;
        });
    }

    const updateForm = (key: keyof Survey, newValue: any) => {
        // @ts-ignore
        setForm(prevForm => {
            const newForm = { ...prevForm, [key]: newValue }
            setDebounceToSaveField(newForm);
            return newForm;
        });
    }

    const handleUpdatePosition = async (fieldId: number, newPosition: number) => {
        const patchOrderField = async (field: SurveyField) => {
            const requestOptions = {
                method: "PUT",
                headers: { Authorization: 'Bearer ' + accessToken, 'Content-Type': 'application/json' },
                body: JSON.stringify({ order: field.order })
            }
            await fetch(`${API_URL}/survey/${id}/field/${field.id}`, requestOptions);
        }

        const fields = form!.fields;
        const oldIndex = fields.findIndex(f => f.id === fieldId);
        const newFieldsArray = moveElement(fields, oldIndex, newPosition - 1);
        setForm(prev => {
            const newForm = { ...prev!, fields: newFieldsArray };
            return newForm;
        });
        await Promise.all(newFieldsArray.map(patchOrderField));
    }

    const handleUpdateField = (newField: SurveyField, fieldId: number) => {
        // @ts-ignore
        setForm(prevForm => {
            const newFields = prevForm!.fields.map(field => field.id === fieldId ? newField : field);
            return { ...prevForm, fields: newFields };
        });
    }

    const fetchOrganizations = async () => {
        const headers = { Authorization: 'Bearer ' + accessToken };
        const response = await fetch(API_URL + '/organization', { headers });
        if (!response.ok) {
            return handleErrorInFetchRequest(response, setNotificationInformations, notificationRef, i18n.language as "fr" | "en", t);
        }

        const data = await response.json();
        setOrganizations(data);
    }

    const getForm = async () => {
        const headers = { Authorization: 'Bearer ' + accessToken };
        const response = await fetch(API_URL + '/survey/' + id, { headers });
        if (!response.ok) {
            return handleErrorInFetchRequest(response, setNotificationInformations, notificationRef, i18n.language as "fr" | "en", t);
        }

        const data = await response.json();
        if (data.isPublic) return navigate(`form/${id}/answers"`);

        setForm(data);
    }

    useEffect(() => {
        fetchOrganizations();
        getForm();
    }, []);

    return (
        <>
            {organizations && form && <>
                <div className="relative flex flex-col pb-12 min-h-screen">
                    <div className="flex-grow w-4/5 mx-auto pt-10 divide-y-2">
                        {form ? <div className="flex flex-col gap-6 pb-12">
                            <InputField
                                modelValue={form.title}
                                onUpdate={(e) => updateForm('title', e)}
                                id="form-title"
                                type="text"
                                required={true}
                                label={t("FormTitle")}
                                disabled={false}
                            />

                            <InputField
                                modelValue={form.description}
                                onUpdate={(e) => updateForm('description', e)}
                                id="form-description"
                                type="textarea"
                                required={true}
                                label={t("FormDesc")}
                                disabled={false}
                            />

                            <div className="flex flex-col-reverse gap-6 md:grid md:grid-cols-2">
                                <SiteCheckbox
                                    id="form-published"
                                    onUpdate={onTriggerPublishButton}
                                    label={t("FormPublish")}
                                    modelValue={form.isPublic}
                                />

                                <SiteSelect
                                    modelValue={form.organizationId}
                                    onUpdate={(e) => updateForm('organizationId', e)}
                                    options={organizations.map((org) => ({ id: org.id, label: org.name }))}
                                    required={false}
                                    label={t("Organization")}
                                />
                            </div>
                        </div> : null}

                        <div
                            className="divide-y flex flex-col mx-auto gap-5 mb-14"
                            key={updatingKey}
                        >
                            {fieldsOrdered && fieldsOrdered.length > 0 && fieldsOrdered.map((field, index) => (
                                <div
                                    className="pt-5"
                                    key={`field-${field.id}`}
                                >
                                    <SurveyFieldBuilder
                                        currentPlaceOfField={index + 1}
                                        field={field}
                                        numberOfFields={fieldsOrdered.length}
                                        surveyId={form!.id}
                                        onDeleteField={() => deleteField(field.id)}
                                        onUpdatePosition={(newPosition) => handleUpdatePosition(field.id, newPosition)}
                                        onUpdateField={newField => handleUpdateField(newField, field.id)}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="fixed bottom-6 self-center">
                        <button
                            className="px-6 py-3 text-white bg-gradient-to-r from-green-400 to-green-600 hover:from-green-500 hover:to-green-700 focus:ring-4 focus:ring-green-300 rounded-lg shadow-lg shadow-green-500/50 hover:shadow-xl transition-all duration-300 ease-in-out"
                            onClick={createNewField}
                        >
                            {t("AddField")}
                        </button>
                    </div>

                    <div ref={bottomRef}></div>
                </div>

                <ConfirmationModal ref={modalRef}>
                    <p>{t("PublishVerif")}</p>
                </ConfirmationModal>
            </>}

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

export default FormEditionPage;