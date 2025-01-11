import { TrashIcon } from "@heroicons/react/24/outline";
import ModalUser from "./ModalUser";
import { User, UserWithoutAccessToken } from "../utils/types";
import { useState } from "react";
import AvatarIcon from "./AvatarIcon";
import { useSelector } from "react-redux";

interface Props {
    user: UserWithoutAccessToken;
    onRemoveUser: () => void;
    onUpdateUser: (newUser: UserWithoutAccessToken) => void;
}

const UserCard = (props: Props) => {
    const userLoggedIn = useSelector((state: any) => state.user.user) as User;
    const canUpdateOrDeleteUser = userLoggedIn.id !== props.user.id;
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [user, setUser] = useState(props.user);

    const handleUpdateUser = (newUser: any) => {
        if(!canUpdateOrDeleteUser) return;
        setUser(newUser);
        setIsModalOpen(false);
        props.onUpdateUser(newUser);
    }

    const handleRequestOpenModal = () => {
        canUpdateOrDeleteUser && setIsModalOpen(true);
    }

    const deleteUser = (e: any) => {
        if(!canUpdateOrDeleteUser) return;
        e.stopPropagation();
        props.onRemoveUser();
    }

    return (<>
        <div
            className="sm:border h-full group flex items-center border-gray-200 bg-white px-4 py-5 sm:px-6 cursor-pointer"
            onClick={handleRequestOpenModal}
        >
            <div className="-ml-4 -mt-4 flex flex-wrap items-center justify-between sm:flex-nowrap">
                <div className="ml-4 mt-4">
                    <div className="flex items-center">
                        <div className="shrink-0 size-12 relative">
                            <AvatarIcon label={user.firstName.charAt(0) + user.lastName.charAt(0)} />
                            {canUpdateOrDeleteUser && <div
                                className="cursor-pointer bg-red-600 opacity-100 sm:opacity-0  sm:group-hover:opacity-100 size-7 rounded-full absolute -bottom-2 right-0 flex justify-center items-center"
                                onClick={deleteUser}
                            >
                                <TrashIcon className="size-5 text-white" />
                            </div>}
                        </div>
                        <div className="ml-4 overflow-hidden">
                            <h3 className="text-base font-semibold text-gray-900">
                                {user.firstName + ' ' + user.lastName}
                            </h3>

                            <p className="text-sm text-gray-500 overflow-hidden w-full text-wrap break-words">
                                @ <span>{user.email}</span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <ModalUser
            mode="edition"
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onUpdateUser={handleUpdateUser}
            user={user}
        />
    </>)
}

export default UserCard;