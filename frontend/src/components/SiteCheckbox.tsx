import React from "react";

interface Props {
    id: string;
    modelValue?: boolean;
    label?: string;
    disabled?: boolean;
    onUpdate?: (value: boolean) => void;
}

const SiteCheckbox: React.FC<Props> = ({
    id,
    modelValue = false,
    label = "",
    disabled = false,
    onUpdate,
}) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const valueToUpdate = e.target.checked;
        onUpdate && onUpdate(valueToUpdate);
    };

    return (
        <div className="relative flex items-start">
            <div className="flex h-6 items-center">
                <input
                    id={id}
                    name={id}
                    type="checkbox"
                    checked={modelValue}
                    disabled={disabled}
                    onChange={handleChange}
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600 cursor-pointer"
                />
            </div>

            <label
                htmlFor={id}
                className="ml-2 text-sm leading-6 flex items-center gap-1 cursor-pointer"
            >
                <div>
                    <span className="font-medium text-gray-900">{label}</span>
                </div>
            </label>
        </div>
    );
};

export default SiteCheckbox;
