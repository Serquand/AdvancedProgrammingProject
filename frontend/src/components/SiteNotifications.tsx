import { useState, useRef, useEffect, forwardRef, useImperativeHandle, ReactNode } from "react";
import { XMarkIcon } from "@heroicons/react/20/solid";

type Props = {
    title: string;
    information: string;
    isError?: boolean;
    children?: ReactNode;
};

export interface NotificationRef {
    openNotifications: () => void;
}

const SiteNotifications = forwardRef<NotificationRef, Props>(
    ({ title, information, children }: Props, ref) => {
        const [show, setShow] = useState(false);
        const timeoutRef = useRef<number | null>(null);

        // Expose `openNotifications` to the parent via ref
        useImperativeHandle(ref, () => ({
            openNotifications: () => {
                setShow(true);
                if (timeoutRef.current) clearTimeout(timeoutRef.current);
                timeoutRef.current = window.setTimeout(() => setShow(false), 5000); // Close after 5 seconds
            },
        }));

        // Cleanup timeout on unmount
        useEffect(() => {
            return () => {
                if (timeoutRef.current) clearTimeout(timeoutRef.current);
            };
        }, []);

        return (
            <div
                aria-live="assertive"
                className="pointer-events-none fixed inset-0 flex px-4 py-6 items-start sm:p-6 z-[70]"
            >
                <div className="flex w-full flex-col items-center space-y-4 sm:items-end">
                    {show && (
                        <div
                            className="pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5 transition-transform transform ease-out duration-300"
                        >
                            <div className="p-4">
                                <div className="flex items-start">
                                    {children && (
                                        <div className="flex-shrink-0">
                                            {children}
                                        </div>
                                    )}

                                    <div className="ml-3 w-0 flex-1 pt-0.5">
                                        <p className="text-sm font-medium text-gray-900">{title}</p>
                                        <p className="mt-1 text-sm text-gray-500">{information}</p>
                                    </div>

                                    <div className="ml-4 flex flex-shrink-0">
                                        <button
                                            type="button"
                                            className="inline-flex rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                            onClick={() => setShow(false)}
                                        >
                                            <span className="sr-only">Close</span>
                                            <XMarkIcon className="h-5 w-5" aria-hidden="true" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }
);

export default SiteNotifications;
