import { isEmpty } from 'lodash';
import { Answer, SurveyFieldType } from '../utils/types';
import DensityChart from './DensityChart';
import PieChart from './PieChart';
import InputField from './SiteGlobalInput';
import { useTranslation } from 'react-i18next';

interface Props {
    answers: Answer[],
    label: string;
    fieldType: SurveyFieldType;
    minValue: number;
    maxValue: number;
}

const SiteGlobalKPI = (props: Props) => {
    const { t } = useTranslation();
    const convertAnswerInOccurenceAnswer = (answers: Answer[]): { label: string; occurrences: number }[] => {
        const occurrencesMap = new Map();
        answers
            .map((answer) => answer.value)
            .flat()
            .forEach(value => {
                if (occurrencesMap.has(value)) {
                    occurrencesMap.set(value, occurrencesMap.get(value) + 1);
                } else {
                    occurrencesMap.set(value, 1);
                }
            });
        return Array.from(occurrencesMap.entries()).map(([label, occurrences]) => ({ label, occurrences }));
    }

    if (props.answers.length === 0) return (<p className='text-center'>
        {t("Ce champ n'a encore aucune réponse !")}
    </p>);

    if (props.fieldType === SurveyFieldType.CHECKBOX || props.fieldType === SurveyFieldType.SELECT) return <>
        <PieChart
            questionLabel={props.label}
            responsesOccurence={convertAnswerInOccurenceAnswer(props.answers)}
        />
    </>

    if (props.fieldType === SurveyFieldType.NUMBER) return <DensityChart
        numbers={props.answers.map(answer => answer.value as number)}
        maxValue={props.maxValue}
        minValue={props.minValue}
    />

    return (<>
        <div className='flex flex-col gap-4'>
            {(props.fieldType === SurveyFieldType.TEXT || props.fieldType === SurveyFieldType.TEXTAREA) &&
                props.answers.map((answer, index) =>
                    !isEmpty(answer) && (
                        <InputField
                            modelValue={answer.valueText}
                            id={`answer-to${answer.questionId}-number-${index}`}
                            disabled={true}
                            key={index}
                            type={props.fieldType === SurveyFieldType.TEXT ? 'text' : 'textarea'}
                        />
                    )
                )
            }
        </div>
    </>)
}

export default SiteGlobalKPI;