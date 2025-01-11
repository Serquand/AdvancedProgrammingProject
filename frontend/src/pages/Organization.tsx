import { useEffect, useMemo, useRef, useState } from "react";
import { NotificationsInformations, Organization, User, UserWithoutAccessToken } from "../utils/types";
import CreateOrganizationModal from "../components/CreateOrganizationForm";
import { PencilSquareIcon, PlusIcon, TrashIcon, XCircleIcon } from "@heroicons/react/24/outline";
import { useSelector } from "react-redux";
import ConfirmationModal, { ConfirmationModalRef } from "../components/ConfirmationModal";
import CollapsibleSection from "../components/CollapsibleSection";
import InputField from "../components/SiteGlobalInput";
import { findSearchedArray, groupBy, handleErrorInFetchRequest, reorderObject } from "../utils/utils";
import Notification, { NotificationRef } from "../components/SiteNotifications";
import { useTranslation } from "react-i18next";
import AvatarIcon from "../components/AvatarIcon";

const OrganizationPage = () => {
    const { t, i18n } = useTranslation();
    const [organizations, setOrganizations] = useState<Organization[] | undefined>(undefined);
    const [users, setUsers] = useState<UserWithoutAccessToken[] | undefined>(undefined);
    const [isModalCreationOpen, setIsModalCreationOpen] = useState<boolean>(false);
    const [organizationDescribedId, setOrganizationDescribedId] = useState<number>(-1);
    const [updatedOrganizationId, setUpdatedOrganizationId] = useState<number | undefined>(undefined);
    const [organizationSearchQuery, setOrganizationSearchQuery] = useState<string>("");
    const [userSearchQuery, setUserSearchQuery] = useState<string>("");
    const userLoggedIn = useSelector((state: any) => state.user.user) as User;
    const modalRef = useRef<ConfirmationModalRef>(null);
    const accessToken = userLoggedIn.accessToken;
    const API_URL = import.meta.env.VITE_API_URL;

    // Notifications
    const emptyNotificationsInformations: NotificationsInformations = { informations: "", title: "" };
    const [notificationInformations, setNotificationInformations] = useState<NotificationsInformations>(emptyNotificationsInformations);
    const notificationRef = useRef<NotificationRef>(null);

    const organizationsSearched = useMemo(() => findSearchedArray<Organization>(organizations, organizationSearchQuery, ["name"]), [organizationSearchQuery, organizations]);
    const usersSearched = useMemo(() => {
        if (!users) return [];
        const localUsers = users.map((user) => ({ ...user, fullName: user.firstName + ' ' + user.lastName }))
        return findSearchedArray<UserWithoutAccessToken & { fullName: string }>(localUsers, userSearchQuery, ["email", "firstName", "lastName", "fullName"]);
    }, [userSearchQuery, users]);

    const usersGrouped = useMemo(() => {
        if (!usersSearched || usersSearched.length === 0) return;
        const localGroup = groupBy<UserWithoutAccessToken, any>(usersSearched, "role");
        return reorderObject<UserWithoutAccessToken>(localGroup, ["teacher", "student"]);
    }, [userSearchQuery, usersSearched, users]);

    const fetchUsers = async () => {
        const headers = { Authorization: 'Bearer ' + accessToken };
        const response = await fetch(API_URL + '/user/all?roles=teacher&roles=student', { headers });
        if (!response.ok) {
            return handleErrorInFetchRequest(response, setNotificationInformations, notificationRef, i18n.language as "fr" | "en", t);
        }
        const data = await response.json();
        setUsers(data);
    }

    const fetchOrganizations = async () => {
        const headers = { Authorization: 'Bearer ' + accessToken };
        const response = await fetch(API_URL + '/organization', { headers });
        if (!response.ok) {
            return handleErrorInFetchRequest(response, setNotificationInformations, notificationRef, i18n.language as "fr" | "en", t);
        }

        const data = await response.json();
        setOrganizationDescribedId(data && data.length > 0 ? data[0].id : -1);
        setOrganizations(data);
    }

    const fetchAllInformations = async () => {
        await Promise.all([fetchOrganizations(), fetchUsers()])
    }

    const toggleUserPresenceInOrganization = async (userId: number) => {
        const organization = organizations!.find(org => org.id === organizationDescribedId);
        let members;

        if (isUserOnOrganization(userId)) {
            members = organization!.users
                .filter(user => user.id !== userId)
        } else {
            const newUser = users!.find(user => user.id === userId);
            members = [...organization!.users, newUser!];
        }

        setOrganizations(prev => {
            const updatedOrganizations = prev!.map(org => {
                if (org.id === organizationDescribedId) return { ...org, users: members };
                return org;
            });
            return updatedOrganizations;
        });

        updateOrganization({ memberIds: members.map(user => user.id) }, organizationDescribedId)
    }

    useEffect(() => {
        fetchAllInformations();
    }, []);

    const isUserOnOrganization = (userId: number) => {
        if (!organizations) return false;

        const organization = organizations.find(org => org.id === organizationDescribedId);
        if (!organization) return false;

        const userFoundInOrganization = organization.users.find((user) => user.id === userId);
        return !!userFoundInOrganization;
    }

    const addOrganization = (newOrganization: Organization) => {
        if (!organizations) return;

        setOrganizationDescribedId(newOrganization.id);
        setOrganizations([...organizations, newOrganization])
        setIsModalCreationOpen(false);
    }

    const updateOrganization = async (updatedOrganization: any, organizationId: number) => {
        const requestOptions = {
            headers: {
                "Content-Type": 'application/json',
                Authorization: 'Bearer ' + accessToken,
            },
            method: "PUT",
            body: JSON.stringify(updatedOrganization)
        }
        const response = await fetch(`${API_URL}/organization/${organizationId}`, requestOptions);
        if (!response.ok) {
            return handleErrorInFetchRequest(response, setNotificationInformations, notificationRef, i18n.language as "fr" | "en", t);
        }
    }

    const deleteOrganization = async (event: any, organizationId: number) => {
        event.stopPropagation();

        if (!modalRef.current) return;
        const validateUserDeletion = await modalRef.current.openModal();
        if (!validateUserDeletion) return;

        if (!organizations) return;
        const allOthersOrganization = organizations.filter((org) => org.id !== organizationId);

        if (organizationId === organizationDescribedId) {
            setOrganizationDescribedId(allOthersOrganization.length > 0 ? allOthersOrganization[0].id : -1);
        }

        const requestOptions = {
            headers: { Authorization: 'Bearer ' + accessToken },
            method: "DELETE"
        };
        const response = await fetch(`${API_URL}/organization/${organizationId}`, requestOptions);
        if (!response.ok) {
            return handleErrorInFetchRequest(response, setNotificationInformations, notificationRef, i18n.language as "fr" | "en", t);
        }

        setOrganizations(allOthersOrganization);
    }

    const triggerClickOnOrganizationEdit = (organizationId: number) => {
        setUpdatedOrganizationId(organizationId);
        setIsModalCreationOpen(true)
    }

    const handleOrganizationNameUpdate = (newOrganization: Organization, organizationId: number) => {
        if (!organizations) return;

        setUpdatedOrganizationId(undefined);
        setIsModalCreationOpen(false);
        setOrganizations(prev => {
            const updatedOrganizations = prev!.map(org => {
                if (org.id === organizationId) return { ...org, name: newOrganization.name };
                return org;
            });
            return updatedOrganizations;
        })
    }

    const handleOnCloseCreateOrganizationModal = () => {
        setIsModalCreationOpen(false);
        setUpdatedOrganizationId(undefined);
    }

    return (
        <>
            {/* Without organizations */}
            {organizations && organizations.length === 0 && <p className="h-screen flex items-center justify-center text-xl">{t("NoOrganization")}</p>}

            {/* For laptop / huge screen */}
            {organizations && organizations.length > 0 && organizationsSearched && users && usersSearched ? <div className="h-screen hidden md:flex">
                <div className="w-1/2 overflow-y-scroll bg-gray-100">
                    <div className="px-4">
                        <InputField
                            id="organization-search"
                            modelValue={organizationSearchQuery}
                            placeholder="Organisation"
                            onUpdate={(e) => setOrganizationSearchQuery(e as string)}
                        />
                    </div>

                    <ul className="p-4 space-y-2">
                        {organizationsSearched.map((org) => (
                            <li
                                key={`org-${org.id}`}
                                className={`py-2 px-4 shadow rounded cursor-pointer flex items-center gap-x-3 ${org.id === organizationDescribedId
                                    ? "bg-blue-600 text-white"
                                    : "bg-white"
                                    }`}
                                onClick={() => setOrganizationDescribedId(org.id)}
                            >
                                <div className="size-10">
                                    <AvatarIcon label={org.name.charAt(0).toUpperCase()} />
                                </div>
                                {org.name}
                                <div className="ml-auto flex gap-3">
                                    <PencilSquareIcon
                                        onClick={() => triggerClickOnOrganizationEdit(org.id)}
                                        className="h-6 w-6"
                                    />
                                    <TrashIcon
                                        className="h-6 w-6 text-red-600 ml-auto"
                                        onClick={(event) => deleteOrganization(event, org.id)}
                                    />
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="w-1/2 overflow-y-scroll bg-gray-200">
                    <div className="px-4">
                        <InputField
                            id="user-search-query"
                            modelValue={userSearchQuery}
                            placeholder="Utilisateurs"
                            onUpdate={e => setUserSearchQuery(e as string)}
                        />
                    </div>

                    <ul className="p-4 space-y-2">
                        {users && usersGrouped && (Object.keys(usersGrouped)).map((element) =>
                            <div className="bg-white rounded-lg">
                                <CollapsibleSection title={t(element)}>
                                    <div className="grid divide-y sm:divide-y-0 sm:mt-4 grid-cols-1 w-full sm:gap-2">
                                        {users && usersGrouped && usersGrouped[element] && usersGrouped[element].map((user) => (
                                            <li
                                                onClick={() => toggleUserPresenceInOrganization(user.id)}
                                                key={`org-${user.id}`}
                                                className={`py-2 px-4 shadow rounded cursor-pointer items-center flex gap-x-3 ${isUserOnOrganization(user.id)
                                                    ? "bg-blue-600 text-white"
                                                    : "bg-white"
                                                    }`}
                                            >
                                                <div className="size-10">
                                                    <AvatarIcon label={(user.lastName.charAt(0) + user.firstName.charAt(0)).toUpperCase()} />
                                                </div>
                                                <p>
                                                    {user.firstName} {user.lastName.toUpperCase()} <br />
                                                    <span className="text-thin text-sm">{user.email}</span>
                                                </p>
                                            </li>
                                        ))}
                                    </div>
                                </CollapsibleSection>
                            </div>
                        )}
                    </ul>
                </div>
            </div> : null}

            {/* For mobile / little screen */}
            {organizations && organizations.length > 0 && organizationsSearched && users && usersSearched &&
                <div className="block md:hidden">
                    <InputField
                        id="organization-search"
                        modelValue={organizationSearchQuery}
                        placeholder="Organisation"
                        onUpdate={(e) => setOrganizationSearchQuery(e as string)}
                    />
                    {organizationsSearched.map(organization => (
                        <CollapsibleSection
                            title={organization.name}
                            isClosedFromOutside={organizationDescribedId !== organization.id}
                            handleOnClick={() => setOrganizationDescribedId(organization.id)}
                        >
                            <div className="mb-3">
                                <InputField
                                    id="user-search-query"
                                    modelValue={userSearchQuery}
                                    placeholder="Utilisateurs"
                                    onUpdate={e => setUserSearchQuery(e as string)}
                                />
                            </div>
                            {users && usersGrouped && (Object.keys(usersGrouped)).map((element) =>
                                <div className="bg-white rounded-lg my-3">
                                    <CollapsibleSection title={t(element)}>
                                        <ul className="grid divide-y sm:divide-y-0 sm:mt-4 grid-cols-1 w-full gap-y-1.5">
                                            {users && usersGrouped && usersGrouped[element] && usersGrouped[element].map((user) => (
                                                <li
                                                    onClick={() => toggleUserPresenceInOrganization(user.id)}
                                                    key={`org-${user.id}`}
                                                    className={`py-2 px-4 shadow rounded cursor-pointer items-center flex gap-x-3 ${isUserOnOrganization(user.id)
                                                        ? "bg-blue-600 text-white"
                                                        : "bg-white"
                                                        }`}
                                                >
                                                    <div className="size-10">
                                                        <AvatarIcon label={(user.lastName.charAt(0) + user.firstName.charAt(0)).toUpperCase()} />
                                                    </div>

                                                    <p>
                                                        {user.firstName} {user.lastName.toUpperCase()} <br />
                                                        <span className="text-thin text-sm">{user.email}</span>
                                                    </p>
                                                </li>
                                            ))}
                                        </ul>
                                    </CollapsibleSection>
                                </div>
                            )}
                        </CollapsibleSection>
                    ))}
                </div>
            }

            <div
                className="fixed bottom-10 right-10 size-14 rounded-full bg-green-600 flex items-center justify-center cursor-pointer"
                onClick={() => setIsModalCreationOpen(true)}
            >
                <PlusIcon className="size-10 text-white" />
            </div>

            <CreateOrganizationModal
                isOpen={isModalCreationOpen}
                onClose={handleOnCloseCreateOrganizationModal}
                onOrganizationCreate={addOrganization}
                mode={!!updatedOrganizationId ? 'edition' : 'creation'}
                onOrganizationUpdate={handleOrganizationNameUpdate}
                updatedOrganizationId={updatedOrganizationId}
            />

            <ConfirmationModal ref={modalRef}>
                <p>{t("ConfirmOrganizationDeletion")}</p>
            </ConfirmationModal>

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

export default OrganizationPage;