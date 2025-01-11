import { useState } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import {
    NewspaperIcon,
    UserGroupIcon,
    XMarkIcon,
    DocumentPlusIcon,
    UserCircleIcon,
    Bars3Icon,
    XCircleIcon,
} from '@heroicons/react/24/outline';
import { Dialog, Transition, TransitionChild, DialogPanel } from '@headlessui/react';
import { Roles, User } from '../utils/types';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { logout } from '../utils/auth';
import LanguageSwitcher from '../components/LanguageSwitcher';

interface NavigationOption {
    to: string;
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    label: string;
    id: string | number;
    current: boolean;
    neededRole: Roles[];
    callbackTriggered?: () => void;
}

const Layout: React.FC = () => {
    const { t } = useTranslation();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const user = useSelector((state: any) => state.user.user) as User;
    const navigate = useNavigate();

    const navigationCategories: NavigationOption[] = [
        {
            id: 'to-fill',
            label: `${t('FormsToComplete')}`,
            icon: DocumentPlusIcon,
            to: '/to-fill',
            current: false,
            neededRole: [Roles.STUDENT],
        },
        {
            id: 'filled',
            label: `${t('FormsCompleted')}`,
            icon: NewspaperIcon,
            to: '/filled',
            current: false,
            neededRole: [Roles.STUDENT]
        },
        {
            id: 'organization',
            label: `${t("Organization")}s`,
            icon: UserGroupIcon,
            to: '/organization',
            current: false,
            neededRole: [Roles.ADMIN]
        },
        {
            id: 'forms',
            label: `${t("Forms")}`,
            icon: NewspaperIcon,
            to: '/forms',
            current: false,
            neededRole: [Roles.ADMIN, Roles.TEACHER]
        },
        {
            id: 'users',
            label: `${t("user")}`,
            to: '/users',
            icon: UserCircleIcon,
            current: false,
            neededRole: [Roles.ADMIN]
        },
        {
            id: 'sign-up',
            label: `${t("exit")}`,
            to: '/',
            icon: XCircleIcon,
            current: false,
            neededRole: [Roles.ADMIN, Roles.STUDENT, Roles.TEACHER],
            callbackTriggered: () => logout(navigate)
        }
    ];

    const sendNavigationOptions = () => {
        return (
            <>
                <nav className="flex flex-1 flex-col">
                    {navigationCategories.map((link) => (
                        <ul className="-mx-2 space-y-1">
                            <li key={link.id}>
                                {link.neededRole.includes(user?.role) ? <Link
                                    to={link.to}
                                    className={`flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold ${link.current
                                        ? 'bg-gray-800 text-white'
                                        : 'text-gray-400 hover:text-white hover:bg-gray-800'
                                        }`}
                                    onClick={() => {
                                        setSidebarOpen(false);
                                        link.callbackTriggered && link.callbackTriggered();
                                    }}
                                >
                                    <link.icon className="h-6 w-6 shrink-0" aria-hidden="true" />
                                    {link.label}
                                </Link> : null}
                            </li>
                        </ul>
                    ))}
                </nav>
                <LanguageSwitcher />
            </>
        )
    }

    return (
        <div className="h-full">
            <Transition show={sidebarOpen} as="div">
                <Dialog as="div" className="relative z-[100] lg:hidden" onClose={() => setSidebarOpen(false)}>
                    <TransitionChild
                        enter="transition-opacity ease-linear duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="transition-opacity ease-linear duration-300"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-gray-900/80" />
                    </TransitionChild>

                    <div className="fixed inset-0 flex">
                        <TransitionChild
                            enter="transition ease-in-out duration-300 transform"
                            enterFrom="-translate-x-full"
                            enterTo="translate-x-0"
                            leave="transition ease-in-out duration-300 transform"
                            leaveFrom="translate-x-0"
                            leaveTo="-translate-x-full"
                        >
                            <DialogPanel className="relative mr-16 flex w-full max-w-xs flex-1">
                                <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                                    <button
                                        type="button"
                                        className="-m-2.5 p-2.5"
                                        onClick={() => setSidebarOpen(false)}
                                    >
                                        <span className="sr-only">Close sidebar</span>
                                        <XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
                                    </button>
                                </div>
                                <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-gray-900 px-6 pb-4 ring-1 ring-white/10">
                                    <img
                                        className="w-10"
                                        src="/Logo SurvEfrei.png"
                                        alt="Logo SurvEfrei"
                                    />
                                    {sendNavigationOptions()}
                                </div>
                            </DialogPanel>
                        </TransitionChild>
                    </div>
                </Dialog>
            </Transition>

            <div className="fixed inset-x-0 top-0 z-[60] lg:hidden flex items-center">
                <div className="bg-gray-900 px-5 sm:px-7 h-20 flex flex-row items-center justify-between w-full">
                    <Bars3Icon
                        className="size-10 sm:size-12 text-white cursor-pointer px-2 py-0"
                        aria-hidden="true"
                        onClick={() => setSidebarOpen(true)}
                    />

                    <div className="flex items-center gap-3">
                        <img
                            className="h-10 sm:h-12 w-auto"
                            src="/Logo SurvEfrei.png"
                            alt="Logo SurvEfrei"
                        />
                    </div>
                </div>
            </div>

            {/* Static Sidebar for Desktop */}
            <div className="hidden lg:fixed lg:inset-y-0 lg:z-40 lg:flex lg:w-72 lg:flex-col">
                <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-gray-900 px-6 pb-4">
                    <div className='flex flex-col items-center pt-6 gap-4'>
                        <img
                            className="w-10"
                            src="/Logo SurvEfrei.png"
                            alt="Logo SurvEfrei"
                        />
                        <h1 className='text-white text-2xl font-semibold'>Surv'Efrei</h1>
                    </div>
                    {sendNavigationOptions()}
                </div>
            </div>

            {/* Main Content */}
            <main className="h-full ml-0 pt-20 relative lg:pt-0 lg:ml-72">
                <Outlet />
            </main>
        </div>
    );
};

export default Layout;