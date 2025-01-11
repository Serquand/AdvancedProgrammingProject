import { useState, forwardRef, useImperativeHandle, ReactNode } from "react";
import { useTranslation } from "react-i18next";

interface ConfirmationModalProps {
    children: ReactNode;
}

export interface ConfirmationModalRef {
    openModal: () => Promise<boolean>;
}

const ConfirmationModal = forwardRef<ConfirmationModalRef, ConfirmationModalProps>(
    ({ children }, ref) => {
        const { t } = useTranslation();
        const [isOpen, setIsOpen] = useState(false);
        const [resolvePromise, setResolvePromise] = useState<((value: boolean) => void) | null>(null);

        // Expose methods to the parent component
        useImperativeHandle(ref, () => ({
            openModal: () => {
                setIsOpen(true);
                return new Promise<boolean>((resolve) => {
                    setResolvePromise(() => resolve);
                });
            },
        }));

        const handleCancel = () => {
            setIsOpen(false);
            if (resolvePromise) resolvePromise(false);
        };

        const handleValidate = () => {
            setIsOpen(false);
            if (resolvePromise) resolvePromise(true);
        };

        if (!isOpen) return null;

        return (
            <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
                <div className="bg-white rounded shadow p-6 max-w-[85%]">
                    <div className="mb-4">{children}</div>
                    <div className="flex justify-end">
                        <button
                            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 mr-3"
                            onClick={handleCancel}
                        >
                            {t("Cancel")}
                        </button>
                        <button
                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                            onClick={handleValidate}
                        >
                            {t("Confirm")}
                        </button>
                    </div>
                </div>
            </div>
        );
    }
);

export default ConfirmationModal;
