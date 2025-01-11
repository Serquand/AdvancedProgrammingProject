import { TrashIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import AvatarIcon from "./AvatarIcon";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { Roles, User } from "../utils/types";

interface Props {
    title: string;
    id: number;
    description: string;
    organizationName: string;
    onDeleteForm: (id: number) => void,
    isPublic: boolean;
    canDelete: boolean;
    mustShowPublicationStatus?: boolean;
}

const SurveyCard = (props: Props) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const user = useSelector((state: any) => state.user.user) as User;

    const navigateToFormPage = () => {
        switch(location.pathname) {
            case '/to-fill': return navigate(`/form/${props.id}/fill`);

            case '/forms':
                if(props.isPublic || user.role === Roles.TEACHER) return navigate(`/form/${props.id}/answers`);
                else return navigate(`/form/${props.id}/edition`);

            case '/filled': return navigate(`/form/${props.id}/review`);
        }
    }

    return (
        <div
            className="md:border group border-gray-300 cursor-pointer bg-white px-4 py-5 sm:px-6"
            onClick={navigateToFormPage}
        >
            <div className="-ml-4 -mt-4 flex flex-wrap items-center justify-between sm:flex-nowrap">
                <div className="ml-4 mt-4">
                    <div className="flex items-center">
                        <div className="shrink-0 relative size-12">
                            <AvatarIcon label={props.title.charAt(0)} />
                        </div>
                        <div className="ml-4 overflow-hidden">
                            <div className="flex gap-2">
                                <h3 className="text-base font-semibold text-gray-900">
                                    <span>{props.title}
                                        {props.mustShowPublicationStatus ? <span>, {t(props.isPublic ? "Published" : "NotPublished")}</span> : null}
                                    </span>
                                </h3>

                                {props.canDelete ? <div
                                    className="size-[22px] flex items-center justify-center rounded-full cursor-pointer opacity-0 group-hover:opacity-100"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        props.onDeleteForm(props.id)
                                    }}
                                >
                                    <TrashIcon className="size-5 text-red-600" />
                                </div> : null}
                            </div>

                            <p className="text-sm text-gray-600 overflow-hidden w-full text-wrap break-words">
                                <span>{props.organizationName}</span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <p className="text-gray-500 text-sm mt-3 line-clamp-3">{props.description}</p>
        </div>
    )
}

export default SurveyCard;