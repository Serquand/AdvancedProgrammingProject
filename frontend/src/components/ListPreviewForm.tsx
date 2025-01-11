import { SurveyPreview } from "../utils/types";
import SurveyCard from "./SurveyCard";
import ConfirmationModal, { ConfirmationModalRef } from "../components/ConfirmationModal";
import { useRef } from "react";
import { useTranslation } from "react-i18next";

interface Props {
    surveys: SurveyPreview[];
    canDelete: boolean;
    onDeleteForm?: (id: number) => void;
    mustShowPublicationStatus?: boolean;
}

const ListPreviewForm = ({ surveys, canDelete, onDeleteForm, mustShowPublicationStatus }: Props) => {
    const { t } = useTranslation();
    const modalRef = useRef<ConfirmationModalRef>(null);

    const handleOnDeleteForm = (id: number) => {
        onDeleteForm && onDeleteForm(id);
    }

    if(surveys && surveys.length === 0) {
        return <p className="h-screen flex items-center justify-center text-xl">{t("NoSurvey")}</p>
    }

    return (
        <>
            <div className="flex divide-y md:divide-y-0 flex-col md:px-12 md:gap-5 md:py-6">
                {surveys ? surveys.map((survey, index) => {
                    return (
                        <div>
                            <SurveyCard
                                description={survey.description}
                                id={survey.id}
                                organizationName={survey.organization.name}
                                title={survey.title}
                                key={index}
                                onDeleteForm={() => handleOnDeleteForm(survey.id)}
                                isPublic={survey.isPublic}
                                canDelete={canDelete}
                                mustShowPublicationStatus={mustShowPublicationStatus}
                            />
                        </div>
                    );
                }) : null}
            </div>

            <ConfirmationModal ref={modalRef}>
                <p>{t("ConfirmSurveyDeletion")}</p>
            </ConfirmationModal>
        </>

    )
}

export default ListPreviewForm;