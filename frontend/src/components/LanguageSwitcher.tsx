import React from "react";
import { Menu, Transition } from "@headlessui/react";
import { ChevronUpIcon } from "@heroicons/react/20/solid";
import { useTranslation } from "react-i18next";

const LanguageSwitcher: React.FC = () => {
    const { i18n } = useTranslation();

    // Liste des langues disponibles avec leurs drapeaux
    const languages = [
        {
            code: "fr",
            name: "Français",
            flag: "/flags/france.png",
        },
        {
            code: "en",
            name: "English",
            flag: "/flags/united-kingdom.png",
        },
    ];

    const changeLanguage = (code: string) => {
        i18n.changeLanguage(code);
    };

    return (
        <Menu as="div" className="relative inline-block text-left">
            <div>
                <Menu.Button className="inline-flex w-full justify-between rounded-md border bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-offset-2 focus:ring-offset-gray-100">
                    <div className="flex gap-2 text-sm">
                        <img
                            src={
                                languages.find((lang) => lang.code === i18n.language)?.flag ||
                                "/flags/default.svg"
                            }
                            alt="Current Language"
                            className="w-5 h-5 mr-2"
                        />
                        <p>{ languages.find((lang) => lang.code === i18n.language)?.name }</p>
                    </div>
                    <ChevronUpIcon
                        className="-mr-1 ml-2 h-5 w-5 text-gray-400"
                        aria-hidden="true"
                    />
                </Menu.Button>
            </div>

            <Transition
                as={React.Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
            >
                <Menu.Items className="absolute w-full bottom-full mb-2 right-0 z-10 mt-2 origin-bottom-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div className="py-1">
                        {languages.map((lang) => (
                            <Menu.Item key={lang.code}>
                                {({ active }) => (
                                    <button
                                        onClick={() => changeLanguage(lang.code)}
                                        className={`${active ? "bg-sky-600 text-white" : "text-gray-700"
                                            } flex items-center gap-2 w-full px-4 py-2 text-sm`}
                                    >
                                        <img
                                            src={lang.flag}
                                            alt={`${lang.name} Flag`}
                                            className="w-5 h-5 mr-2"
                                        />
                                        {lang.name}
                                    </button>
                                )}
                            </Menu.Item>
                        ))}
                    </div>
                </Menu.Items>
            </Transition>
        </Menu>
    );
};

export default LanguageSwitcher;