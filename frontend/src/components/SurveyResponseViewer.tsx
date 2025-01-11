import { SurveyFieldType, SurveyWithAnswer } from "../utils/types";
import { convertFieldTypeToInputType } from "../utils/utils";
import InputField from './SiteGlobalInput';
import SiteCheckbox from "./SiteCheckbox";

interface Props {
    form: SurveyWithAnswer;
}

const SurveyResponseViewer = ({ form }: Props) => {
    return (
        <>
            <div className="grid gap-5">
                {(form && form.fields) ? (<>
                    {form.fields.map((field, index) => (<>
                        {(field.fieldType === SurveyFieldType.TEXTAREA || field.fieldType === SurveyFieldType.TEXT) ? <InputField
                            id={"question-" + field.id}
                            modelValue={field.answers[0].valueText}
                            label={field.label}
                            required={field.required}
                            type={convertFieldTypeToInputType(field.fieldType)}
                            disabled={true}
                            placeholder={field.label}
                            key={index}
                        /> : null}

                        {field.fieldType === SurveyFieldType.NUMBER ? <InputField
                            id={"question-" + field.id}
                            modelValue={field.answers[0].value}
                            label={`${field.label} (min. ${field.minValue}, max. ${field.maxValue})`}
                            required={field.required}
                            type={convertFieldTypeToInputType(field.fieldType)}
                            disabled={true}
                            placeholder={field.label}
                            key={index}
                        /> : null}

                        {field.fieldType === SurveyFieldType.CHECKBOX ? <SiteCheckbox
                            id={"question-" + field.id}
                            label={field.label}
                            modelValue={field.answers[0].value as boolean}
                            disabled={true}
                            key={index}
                        /> : null}

                        {field.fieldType === SurveyFieldType.SELECT ? <InputField
                            id={"question-" + field.id}
                            modelValue={(field.answers[0].value as string[]).join(", ")}
                            label={field.label}
                            required={field.required}
                            type="text"
                            disabled={true}
                            key={index}
                        /> : null}
                    </>))}
                </>) : null}
            </div>
        </>
    )
}

export default SurveyResponseViewer;