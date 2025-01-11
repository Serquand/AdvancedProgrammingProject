import React, { useEffect, useState } from "react";

type Props = {
    title: string;
    children: React.ReactNode;
    handleOnClick?: () => void;
    isClosedFromOutside?: boolean;
    animationRequired?: boolean;
};

const CollapsibleSection = ({handleOnClick, isClosedFromOutside = false, animationRequired = false, ...props}: Props) => {
    const [isOpen, setIsOpen] = useState(true);

    useEffect(() => {
        if(isClosedFromOutside) {
            setIsOpen(false);
        }
    }, [isClosedFromOutside]);

    const toggleOpen = () => {
        handleOnClick && handleOnClick();
        setIsOpen(!isOpen);
    };

    return (
        <div className="border rounded-lg shadow-md p-4">
            <div
                className="flex justify-between items-center cursor-pointer"
                onClick={toggleOpen}
            >
                <h2 className="text-lg font-bold">{props.title}</h2>
                <span className="text-xl">
                    {isOpen ? "▲" : "▼"}
                </span>
            </div>

            <div
                className={`
                    ${animationRequired ? 'transition-all duration-300' : ''}
                    ${isOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0 overflow-hidden"}`
                }
            >
                <div className="mt-4">{props.children}</div>
            </div>
        </div>
    );
};

export default CollapsibleSection;
