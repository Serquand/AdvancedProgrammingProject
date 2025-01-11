import { TFunction } from "i18next";
import { NotificationRef } from "../components/SiteNotifications";
import { NotificationsInformations, SurveyField, SurveyFieldType, SurveyFieldWithAnswer, User, UserWithoutAccessToken } from "./types";
import { SetStateAction, Dispatch, RefObject } from "react";
import { isArray, isObject } from "lodash";

export function generateDistinctColors(count: number) {
    const colors = [];
    const saturation = 70;
    const lightness = 50;

    for (let i = 0; i < count; i++) {
        const hue = Math.floor((360 / count) * i);
        colors.push(`hsl(${hue}, ${saturation}%, ${lightness}%)`);
    }

    return colors;
}

export function moveElement(array: SurveyField[], indexFrom: number, indexTo: number): SurveyField[] {
    const newArray = [...array];
    const [movedElement] = newArray.splice(indexFrom, 1);
    newArray.splice(indexTo, 0, movedElement);

    newArray.forEach((item, index) => item.order = index + 1);
    return newArray;
}

export function sendOrderedFields(fields: (SurveyField | SurveyFieldWithAnswer)[]): (SurveyField | SurveyFieldWithAnswer)[] {
    return fields.sort((a, b) => a.order - b.order);
}

export function calculateMedian(numbers: Array<number>): string {
    const sorted = [...numbers].sort((a, b) => a - b);
    const n = sorted.length;

    if (n % 2 !== 0) {
        const median = sorted[Math.floor(n / 2)];
        return median.toFixed(2);
    }

    const mid1 = n / 2 - 1;
    const mid2 = n / 2;
    const median = (sorted[mid1] + sorted[mid2]) / 2;
    return median.toFixed(2);
}

export function calculateMean(numbers: Array<number>): string {
    const sum = numbers.reduce((a, b) => a + b, 0);
    const mean = sum / numbers.length;
    return mean.toFixed(2);
}

export function findSearchedArray<T>(initialArray: Array<T> | undefined | null, query: string, key: Array<keyof T>): Array<T> | undefined | null {
    const localArray: Array<T> = [];
    if (query.trim() === '' || !initialArray) return initialArray;
    initialArray.forEach((element) => {
        for (const k of key) {
            if ((element[k] as string).toLowerCase().includes(query.toLowerCase())) {
                localArray.push(element);
                return;
            }
        }
    })
    return localArray;
}

export const handleErrorInFetchRequest = async (
    response: Response,
    setInformationsToasterState: Dispatch<SetStateAction<NotificationsInformations>>,
    notificationsRef: RefObject<NotificationRef>,
    language: "fr" | "en",
    translateFunction: TFunction<"translation", undefined>
) => {
    const defaultErrorMessage = {
        title: translateFunction("Error"),
        informations: translateFunction("WentWrong")
    };

    if (response.status === 401 || response.status === 403) {
        return (window.location.href = "/");
    }

    if (response.status === 500) {
        setInformationsToasterState(defaultErrorMessage);
    } else {
        try {
            const data = await response.json();
            const keys = Object.keys(data);
            if (response.status === 400 && keys.includes("message") && isArray(data.message)) {
                setInformationsToasterState({
                    title: translateFunction("BadInformations"),
                    informations: translateFunction("BadInformationsDescription")
                });
            } else if (isObject(data) && keys.includes("fr") && keys.includes("en")) {
                setInformationsToasterState({
                    title: translateFunction("Error"),
                    informations: (data as Record<"fr" | "en", string>)[language] || translateFunction("WentWrong")
                });
            } else {
                throw new Error();
            }
        } catch {
            setInformationsToasterState(defaultErrorMessage);
        } finally {
            if (notificationsRef.current) {
                notificationsRef.current.openNotifications();
            }
        }

    }
};

// @ts-ignore
export function groupBy<T, K extends keyof T>(initialArray: Array<T>, key: K): Record<T[K], T[]> {
    // @ts-ignore
    const localRecords: Record<T[K], T[]> = {};

    for (const item of initialArray) {
        const groupKey = item[key];
        if (!localRecords[groupKey]) {
            localRecords[groupKey] = [];
        }
        localRecords[groupKey].push(item);
    }

    return localRecords;
}

export function updateGroupForLoggedInUser(userLoggedIn: User, groupedUser: Record<any, UserWithoutAccessToken[]>) {
    const user = groupedUser[userLoggedIn.role]?.filter(user => userLoggedIn.id === user.id);
    groupedUser[userLoggedIn.role] = groupedUser[userLoggedIn.role]?.filter(user => userLoggedIn.id !== user.id);
    groupedUser["You"] = user;
    return groupedUser;
}

export function reorderObject<T>(objectToReorder: Record<string, T[]>, priorities: string[]): Record<string, T[]> {
    const reorderedObject: Record<string, T[]> = {};

    for (const priority of priorities) {
        if (objectToReorder[priority] && objectToReorder[priority].length >= 1) {
            reorderedObject[priority] = objectToReorder[priority];
        }
    }

    for (const key of Object.keys(objectToReorder)) {
        if (!priorities.includes(key) && objectToReorder[key]?.length >= 1) {
            reorderedObject[key] = objectToReorder[key];
        }
    }

    return reorderedObject;
}

export const convertFieldTypeToInputType = (fieldType: SurveyFieldType) => {
    switch (fieldType) {
        case SurveyFieldType.NUMBER: return 'number';
        case SurveyFieldType.TEXTAREA: return 'textarea';
        default: return 'text';
    }
}