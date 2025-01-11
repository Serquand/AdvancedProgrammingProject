import { CookieOptions, Response } from 'express';

export function setCookies(res: Response, key: string, value: string) {
    const cookiesOptions: CookieOptions = {
        httpOnly: true,
        maxAge: 30 * 24 * 60 * 60 * 1000, // = 1 month
        secure: process.env.NODE_ENV === "prod"
    }
    res.cookie(key, value, cookiesOptions);
}

export function deleteCookies(res: Response, key: string) {
    const cookiesOptions: CookieOptions = {
        httpOnly: true,
        expires: new Date(0),
        secure: process.env.NODE_ENV === "prod",
    }
    res.cookie(key, "", cookiesOptions);
}