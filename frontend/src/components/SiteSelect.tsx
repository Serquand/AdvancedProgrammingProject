// @ts-nocheck
import React, { useState, useMemo } from "react";
import { Listbox as HeadlessListbox, Transition } from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/20/solid";
import { useTranslation } from 'react-i18next';


interface Props {
    options: readonly (string | object)[];
    modelValue: any | any[];
    label?: string;
    multiple?: boolean;
    optionKey?: string;
    optionLabel?: string;
    nativeSelect?: boolean;
    placeholder?: string;
    customClassButton?: string;
    labelPosition?: "top" | "right";
    required?: boolean;
    onUpdate: (value: any | any[]) => void;
    maxNumberOfChoices?: number;
    disabled?: boolean;
}

const SiteSelect: React.FC<Props> = ({
    options,
    modelValue,
    label = "",
    multiple = false,
    optionKey = "id",
    optionLabel = "label",
    nativeSelect = false,
    placeholder = "Sélectionner une option",
    customClassButton,
    labelPosition = "top",
    required = false,
    maxNumberOfChoices = 1,
    disabled = false,
    onUpdate,
}) => {
    const { t } = useTranslation();
    const translatedPlaceholder = t('SelectOpt', { defaultValue: placeholder });
    const [selected, setSelected] = useState(() => {
        if (multiple) {
            return Array.isArray(modelValue)
                ? modelValue.map((item) => (typeof item === "object" ? item[optionKey] : item))
                : [];
        }
        return typeof modelValue === "object" ? modelValue[optionKey] : modelValue;
    });

    // Transform options to standard format
    const optionsParsed = useMemo(() => {
        if (Array.isArray(options) && options.every((item) => typeof item === "string")) {
            return options.map((optionString) => ({
                [optionKey]: optionString,
                [optionLabel]: optionString,
            }));
        }
        return options as Record<string, string>[];
    }, [options, optionKey, optionLabel]);

    const currentValueSelected = useMemo(() => {
        if (multiple) {
            return optionsParsed.filter((option) =>
                (selected as any[]).includes(option[optionKey])
            );
        }
        return optionsParsed.find((option) => option[optionKey] === selected) || null;
    }, [optionsParsed, selected, optionKey, multiple]);

    const handleSelectChange = (value: any | any[]) => {
        if (multiple && value.length > maxNumberOfChoices) {
            return;
        }

        setSelected(value);
        onUpdate(value);
    };

    const defaultClassButton =
        "h-9 relative w-full flex items-center cursor-default rounded-md bg-white py-2 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-sky-700 sm:text-sm";
    const buttonClassName = customClassButton || defaultClassButton;

    return (
        <>
            {!nativeSelect ? (
                <HeadlessListbox
                    value={selected}
                    onChange={handleSelectChange}
                    multiple={multiple}
                    disabled={disabled}
                >
                    <div className={`relative ${labelPosition === "right" ? "flex items-baseline gap-1" : ""}`}>
                        {label && (
                            <HeadlessListbox.Label className="block text-sm font-medium text-gray-700">
                                {label} {required ? "*" : ""}
                            </HeadlessListbox.Label>
                        )}
                        <div className={`relative ${label && labelPosition === "top" ? "mt-2" : ""}`}>
                            <HeadlessListbox.Button
                                className={`${buttonClassName} ${disabled ? "disabled:bg-slate-100 disabled:text-slate-500" : ""}`}
                                disabled={disabled}
                            >
                                <span className={`block truncate ${!currentValueSelected ? "italic" : ""}`}>
                                    {multiple
                                        ? currentValueSelected.map((item) => item[optionLabel]).join(", ") || translatedPlaceholder
                                        : currentValueSelected
                                            ? currentValueSelected[optionLabel]
                                            : translatedPlaceholder}
                                </span>
                                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                                    <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                                </span>
                            </HeadlessListbox.Button>
                            <Transition
                                leave="transition ease-in duration-100"
                                leaveFrom="opacity-100"
                                leaveTo="opacity-0"
                            >
                                <HeadlessListbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                                    {optionsParsed.map((option, index) => (
                                        <HeadlessListbox.Option
                                            key={index}
                                            value={option[optionKey]}
                                            className={({ active }) =>
                                                `relative cursor-default select-none py-2 pl-3 pr-9 ${active ? "bg-indigo-600 text-white" : "text-gray-900"
                                                }`
                                            }
                                        >
                                            {({ selected, active }) => (
                                                <>
                                                    <span
                                                        className={`block truncate ${selected ? "font-semibold" : "font-normal"
                                                            }`}
                                                    >
                                                        {option[optionLabel]}
                                                    </span>
                                                    {selected && (
                                                        <span
                                                            className={`absolute inset-y-0 right-0 flex items-center pr-4 ${active ? "text-white" : "text-indigo-600"
                                                                }`}
                                                        >
                                                            <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                                        </span>
                                                    )}
                                                </>
                                            )}
                                        </HeadlessListbox.Option>
                                    ))}
                                </HeadlessListbox.Options>
                            </Transition>
                        </div>
                    </div>
                </HeadlessListbox>
            ) : (
                <div className="relative">
                    {label && (
                        <label className="block text-sm font-medium text-gray-700">
                            {label} {required ? "*" : ""}
                        </label>
                    )}
                    <select
                        value={selected}
                        multiple={multiple}
                        className={`block w-full rounded-md border border-gray-300 bg-white py-1.5 pl-3 pr-10 text-gray-900 focus:border-sky-700 sm:text-sm sm:leading-6 max-w-full truncate ${label && labelPosition === "top" ? "mt-2" : ""
                            }`}
                        onChange={(e) => {
                            const value = multiple
                                ? Array.from(e.target.selectedOptions, (opt) => opt.value)
                                : e.target.value;
                            handleSelectChange(value);
                        }}
                    >
                        {optionsParsed.map((option, index) => (
                            <option key={index} value={option[optionKey]}>
                                {option[optionLabel]}
                            </option>
                        ))}
                    </select>
                </div>
            )}
        </>
    );
};

export default SiteSelect;
