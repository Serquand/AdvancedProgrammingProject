import { useDispatch } from "react-redux";
import { Roles, User } from "./types";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { updateUser } from "../context/User";

const API_URL = import.meta.env.VITE_API_URL;

export const fetchProfile = async (accessToken: string) => {
    const profileRequest = await fetch(API_URL + '/user/profile', { headers: { Authorization: 'Bearer ' + accessToken } });
    const profile = await profileRequest.json();
    if (!profileRequest.ok) throw new Error(profile.message);
    return profile;
}

export async function refreshAccessToken(): Promise<false | User> {
    const response = await fetch(API_URL + '/auth/refresh-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
    });

    if(response.ok) {
        const {accessToken} = await response.json();
        const profile = await fetchProfile(accessToken);
        const loggedUser = {...profile, accessToken};
        return loggedUser;
    }
    return false;
}

export const navigateToDefaultPageForRole = (role: Roles, navigate: ReturnType<typeof useNavigate>) => {
    if (role === Roles.STUDENT) return navigate('/to-fill');
    return navigate('/forms');
}

export const navigateToBasisLoggedPage = (role: Roles, navigate: ReturnType<typeof useNavigate>) => {
    const pathname = window.location.pathname.substring(1);
    if(pathname) {
        return navigate(pathname);
    }

    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const redirectQuery = urlParams.get('rq');
    if(redirectQuery) return navigate(`/${redirectQuery}`);

    return navigateToDefaultPageForRole(role, navigate);
}

export const useAuthInitialization = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    useEffect(() => {
        (async () => {
            const userLogged = await refreshAccessToken();
            if (userLogged) {
                dispatch(updateUser(userLogged));
                return navigateToBasisLoggedPage(userLogged.role, navigate);
            }
        })();
    }, []);
}

export const logout = async (navigate: ReturnType<typeof useNavigate>) => {
    const requestOptions = { method: "POST", credentials: "include" };
    // @ts-ignore
    await fetch(API_URL + '/auth/logout', requestOptions);
    navigate("/");
}