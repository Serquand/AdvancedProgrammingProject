import React from "react";

interface Props {
    label?: string;
}

const AvatarIcon: React.FC<Props> = ({ label = "NC" }) => {
    return (
        <span className="relative w-full h-full inline-flex items-center justify-center rounded-full bg-gray-900">
            <span className="font-medium leading-none text-xl text-white uppercase">
                {label}
            </span>
        </span>
    );
};

export default AvatarIcon;
