import { useRef, useState } from "react";
import { SurveyFieldType, SurveyField as SurveyFieldInterface, User, NotificationsInformations } from "../utils/types";
import InputField from "./SiteGlobalInput";
import SiteSelect from "./SiteSelect";
import SiteCheckbox from "./SiteCheckbox";
import { TrashIcon, XCircleIcon } from "@heroicons/react/24/outline";
import { useSelector } from "react-redux";
import { useTranslation } from 'react-i18next';
import { handleErrorInFetchRequest } from "../utils/utils";
import Notification, { NotificationRef } from "./SiteNotifications";

interface Props {
    field: SurveyFieldInterface;
    numberOfFields: number;
    currentPlaceOfField: number;
    surveyId: number;
    onDeleteField: () => void;
    onUpdatePosition: (newPosition: number) => void;
    onUpdateField: (newField: SurveyFieldInterface) => void;
}

const SurveyFieldBuilder = (props: Props) => {
    const { t, i18n } = useTranslation();
    const [value, setValue] = useState(props.field);
    const debounceTimeMs = 1_500;
    const [saveTimeout, setSaveTimeout] = useState<any>(null);
    const API_URL = import.meta.env.VITE_API_URL;
    const userLoggedIn = useSelector((state: any) => state.user.user) as User;
    const accessToken = userLoggedIn.accessToken;

    // Notifications
    const emptyNotificationsInformations: NotificationsInformations = { informations: "", title: "" };
    const [notificationInformations, setNotificationInformations] = useState<NotificationsInformations>(emptyNotificationsInformations);
    const notificationRef = useRef<NotificationRef>(null);

    const fieldTypeOptions = [
        { id: SurveyFieldType.CHECKBOX, label: `${t("Checkbox")}` },
        { id: SurveyFieldType.NUMBER, label: `${t("Number")}` },
        { id: SurveyFieldType.SELECT, label: `${t("Dropdown_list")}` },
        { id: SurveyFieldType.TEXT, label: `${t("Text")}` },
        { id: SurveyFieldType.TEXTAREA, label: `${t("Paragraph")}` },
    ];

    const positionOptions = Array.from(new Array(props.numberOfFields)).map((_, index) => ({
        id: index + 1,
        label: '' + (index + 1),
    }));

    const updateFieldValue = (key: keyof SurveyFieldInterface, newValue: any) => {
        if(key === 'fieldType' && newValue === "SL" && value.choices.length === 0) {
            addChoiceInField();
        } else if (key === 'maximalNumberOfChoices') {
            newValue = Math.min(newValue, value.choices.length);
        } else if (key === 'maxValue') {
            newValue = Math.max(newValue, value.minValue + 1);
        } else if (key === "minValue") {
            newValue = Math.min(newValue, value.maxValue - 1);
        }

        setValue((prevState) => {
            const newState = { ...prevState, [key]: newValue };
            if (key === 'fieldType' || key === 'choices') {
                handleOnBlur(newState);
            }
            return newState;
        });
    };

    const handleOnBlur = (valueToSave?: SurveyFieldInterface) => {
        setDebounceToSaveField(valueToSave ?? value);
        props.onUpdateField(valueToSave ?? value);
    }

    const saveField = async (fieldToSave: SurveyFieldInterface) => {
        // @ts-ignore
        const { id, formId, answers, ...newField } = fieldToSave;
        const choicesToSave = fieldToSave.choices.map(choice => ({ label: choice.label }));
        const requestOptions = {
            headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
            method: "PUT",
            body: JSON.stringify({ ...newField, choices: choicesToSave }),
        };
        await fetch(`${API_URL}/survey/${props.surveyId}/field/${props.field.id}`, requestOptions);
    };

    const setDebounceToSaveField = (fieldToSave: SurveyFieldInterface) => {
        if (saveTimeout) clearTimeout(saveTimeout);

        const timeout = setTimeout(() => saveField(fieldToSave), debounceTimeMs);
        setSaveTimeout(timeout);

        return () => {
            if (saveTimeout) clearTimeout(saveTimeout);
        };
    }

    const updateChoices = (newChoice: string, choiceIndex: number) => {
        // @ts-ignore
        const newChoices = value.choices.map((choice, index) => (index === choiceIndex ? { label: newChoice } : choice));
        updateFieldValue("choices", [...value.choices, newChoice]);
    };

    const deleteField = async () => {
        const requestOptions = {
            headers: { Authorization: `Bearer ${accessToken}` },
            method: "DELETE",
        };
        const response = await fetch(`${API_URL}/survey/${props.surveyId}/field/${props.field.id}`, requestOptions);
        if (!response.ok) {
            return handleErrorInFetchRequest(response, setNotificationInformations, notificationRef, i18n.language as "fr" | "en", t);
        }
        props.onDeleteField();
    };

    const addChoiceInField = () => {
        const newChoice = { label: "Choix " + (value.choices.length + 1) };
        updateFieldValue("choices", [...value.choices, newChoice]);
    }

    const removeChoiceOfField = (choiceIndex: number) => {
        const updatedChoices = value.choices.filter((_, i) => i !== choiceIndex);
        if(value.maximalNumberOfChoices > updatedChoices.length) {
            updateFieldValue("maximalNumberOfChoices", updatedChoices.length);
        }
        updateFieldValue("choices", updatedChoices);
    }

    return (
        <>
            <div className="mx-auto flex flex-col gap-6">
                <div className="flex flex-col md:grid md:grid-cols-2 gap-6">
                    <InputField
                        modelValue={value.label}
                        onUpdate={(e) => updateFieldValue("label", e)}
                        onBlur={handleOnBlur}
                        id={`field-${props.field.id}-label`}
                        type="text"
                        required={true}
                        label={t("NameField")}
                        disabled={false}
                    />

                    <SiteSelect
                        options={fieldTypeOptions}
                        modelValue={value.fieldType}
                        onUpdate={(value) => updateFieldValue("fieldType", value)}
                        label={t("TypeField")}
                    />

                    {value.fieldType === SurveyFieldType.NUMBER && (
                        <>
                            <InputField
                                modelValue={value.minValue}
                                onUpdate={(e) => updateFieldValue("minValue", e)}
                                onBlur={handleOnBlur}
                                id={`field-${props.field.id}-min-value`}
                                type="number"
                                required={true}
                                label={t("ValueMinField")}
                                disabled={false}
                            />
                            <InputField
                                modelValue={value.maxValue}
                                onUpdate={(e) => updateFieldValue("maxValue", e)}
                                onBlur={handleOnBlur}
                                id={`field-${props.field.id}-max-value`}
                                type="number"
                                required={true}
                                label={t("ValueMaxField")}
                                disabled={false}
                            />
                        </>
                    )}

                    {value.fieldType === SurveyFieldType.SELECT && (
                        <div className="flex flex-col gap-4">
                            {value.choices.map((_, index) => (
                                <div className="flex items-end gap-4" key={index}>
                                    <div className="grow">
                                        <InputField
                                            modelValue={value.choices[index].label}
                                            onUpdate={(value) => updateChoices(value + "", index)}
                                            type="text"
                                            id={`field-${value.id}-choice-${index}`}
                                            label={`Choix ${index + 1}`}
                                        />
                                    </div>

                                    {value.choices.length > 1 && <TrashIcon
                                        className="size-6 mb-2 text-red-600 cursor-pointer"
                                        onClick={() => removeChoiceOfField(index)}
                                    />}
                                </div>
                            ))}

                            <button
                                type="button"
                                onClick={addChoiceInField}
                                className="text-green-600 hover:text-green-800 mt-4"
                            >
                                {t("AddAnswer")}
                            </button>
                        </div>
                    )}

                    {value.fieldType === SurveyFieldType.SELECT && (
                        <InputField
                            modelValue={value.maximalNumberOfChoices}
                            onUpdate={(e) => updateFieldValue("maximalNumberOfChoices", e)}
                            onBlur={handleOnBlur}
                            id={`field-${props.field.id}-max-number-of-choices`}
                            type="number"
                            required={true}
                            label={t("MaxAnswer")}
                            disabled={false}
                            min={1}
                            max={value.choices.length}
                        />
                    )}
                </div>

                <div className="ml-auto w-fit flex items-center gap-6">
                    <div className="flex gap-2 items-center">
                        <p>
                            Pos
                            <span className="md:inline hidden">ition</span>
                            <span className="md:hidden inline">.</span>
                            :
                        </p>
                        <SiteSelect
                            options={positionOptions}
                            modelValue={props.currentPlaceOfField}
                            onUpdate={(value) => props.onUpdatePosition(value)}
                            nativeSelect={true}
                        />
                    </div>

                    <SiteCheckbox
                        id={`field-${value.id}-required`}
                        onUpdate={(value) => updateFieldValue("required", value)}
                        label={t("RequiredField")}
                        modelValue={value.required}
                    />

                    <TrashIcon className="size-6 cursor-pointer text-red-600" onClick={deleteField} />
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
};

export default SurveyFieldBuilder;
