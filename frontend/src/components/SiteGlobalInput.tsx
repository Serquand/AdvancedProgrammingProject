import React, { useState, useEffect } from 'react';

interface Props {
    id: string;
    type?: 'text' | 'number' | 'textarea' | 'password' | 'email';
    modelValue: string | number | boolean | string[] | undefined;
    label?: string;
    placeholder?: string;
    hasIcon?: boolean;
    disabled?: boolean;
    maxLength?: number;
    min?: number;
    max?: number | undefined;
    required?: boolean;
    onUpdate?: (value: string | number | boolean | string[] | undefined) => void;
    onBlur?: () => void;
    children?: JSX.Element,
}

const InputField: React.FC<Props> = ({
    id,
    type = 'text',
    modelValue,
    label,
    placeholder,
    disabled = false,
    maxLength,
    min = 1,
    max = undefined,
    required = false,
    onUpdate,
    onBlur,
    children,
}) => {
    const [inputValue, setInputValue] = useState<string | number | boolean | string[] | undefined>(modelValue);

    useEffect(() => {
        setInputValue(modelValue);
    }, [modelValue]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        if(!onUpdate) return;

        const value = e.target.value;
        if (type === 'number') {
            onUpdate(Number.parseInt(value));
        } else {
            onUpdate(value);
        }
    };

    return (
        <div className="relative">
            {label && (
                <label
                    htmlFor={id}
                    className="flex justify-between items-baseline text-sm font-medium text-gray-700 w-full gap-2"
                >
                    {label} {required && '*'}
                </label>
            )}

            <div className="relative rounded-md mt-2">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    {children ? children : null}
                </div>

                {type === 'textarea' && (
                    <textarea
                        id={id}
                        value={String(inputValue)}
                        maxLength={maxLength}
                        disabled={disabled}
                        rows={3}
                        className="block w-full rounded-md mt-1 px-3 py-2 border border-gray-300 placeholder:text-gray-400 focus:outline-none focus:border-sky-700 sm:text-sm sm:leading-6 disabled:bg-slate-100 disabled:text-slate-500"
                        onChange={handleChange}
                        onBlur={() => onBlur && onBlur()}
                    />
                )}

                {type !== 'textarea' && (
                    <input
                        id={id}
                        type={type}
                        value={String(inputValue)}
                        disabled={disabled}
                        placeholder={placeholder}
                        className={`appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md disabled:bg-slate-100 disabled:text-slate-500 focus:outline-none focus:border-sky-700 sm:text-sm ${children ? 'pl-10' : ''}`}
                        maxLength={maxLength}
                        min={min}
                        max={max}
                        onChange={handleChange}
                        onBlur={() => onBlur && onBlur()}
                    />
                )}
            </div>
        </div>
    );
};

export default InputField;
