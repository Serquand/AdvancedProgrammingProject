import React, { useState, useRef, useEffect } from "react";
import Loader from "../components/Loader";
import { useDispatch } from "react-redux";
import { updateUser } from '../context/User';
import { UserWithoutAccessToken } from "../utils/types";
import Notification, { NotificationRef } from "../components/SiteNotifications";
import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/outline";
import { fetchProfile, navigateToBasisLoggedPage } from "../utils/auth";
import { useNavigate } from "react-router-dom";
import SiteCheckbox from "../components/SiteCheckbox";

const LoginPage = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [rememberMe, setRememberMe] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState(false);
    const [notificationTitle, setNotificationTitle] = useState("");
    const [notificationInformations, setNotificationInformations] = useState("");
    const [notificationsSuccess, setNotificationsSuccess] = useState<boolean>(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [mode, setMode] = useState<'login' | 'retrieve_password'>('login');
    const apiUrl = import.meta.env.VITE_API_URL;
    const notificationRef = useRef<NotificationRef>(null);

    useEffect(() => {
        dispatch(updateUser(null));
    }, []);

    const showNotification = () => {
        if (notificationRef.current) {
            notificationRef.current.openNotifications();
        }
    };

    const fetchLogin = async () => {
        const requestOptions = {
            method: "POST",
            body: JSON.stringify({ email, password, rememberMe }),
            headers: { "Content-Type": "application/json" },
            credentials: 'include'
        };

        // @ts-ignore
        const response = await fetch(apiUrl + '/auth/login', requestOptions);
        const informations = await response.json();
        if (!response.ok) throw new Error(informations.message);

        const { accessToken } = informations;
        return accessToken as string;
    }

    const handleLogin = async () => {
        try {
            const accessToken = await fetchLogin();

            const profile: UserWithoutAccessToken = await fetchProfile(accessToken);
            const user = { ...profile, accessToken };
            dispatch(updateUser(user));

            return navigateToBasisLoggedPage(profile.role, navigate);
        } catch (err) {
            console.error(err);
            setNotificationTitle("Error")
            setNotificationInformations("An error has occured when trying to log in");
            showNotification();
        }
    }

    const resetPassword = async () => {
        const requestOptions = {
            method: "POST",
            body: JSON.stringify({ email }),
            headers: { "Content-Type": "application/json" }
        }

        try {
            const response = await fetch(apiUrl + '/auth/forgot-password', requestOptions);
            if (!response.ok) throw new Error();

            setNotificationTitle("Information")
            setNotificationInformations("A password reset link has been sent to your email, if your email was registered in the system");
            setNotificationsSuccess(true);
            setMode("login")
        } catch {
            setNotificationTitle("Error")
            setNotificationInformations("Something went wrong!");
            setNotificationsSuccess(true);
        } finally {
            showNotification();
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        setIsLoading(true);
        if (mode === 'login') {
            handleLogin();
        } else if (mode === 'retrieve_password') {
            resetPassword();
        }
        setIsLoading(false);
    };

    return (
        <>
            {isLoading && <Loader />}
            <Notification
                ref={notificationRef}
                title={notificationTitle}
                information={notificationInformations}
            >
                {notificationsSuccess ?
                    <CheckCircleIcon className="h-6 w-6 text-green-600" /> :
                    <XCircleIcon className="h-6 w-6 text-red-600" />
                }
            </Notification>

            <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
                <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                    <img
                        className="mx-auto h-14 w-auto"
                        src="/Logo SurvEfrei.png"
                        alt="Your Company"
                    />

                    <h2 className="mt-10 text-center text-2xl/9 font-bold tracking-tight text-gray-900">
                        {mode === 'login' ? "Sign in to your account" : "Retrieve your password"}
                    </h2>
                </div>

                <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
                    <form
                        className="space-y-6"
                        method="POST"
                        onSubmit={handleSubmit}
                    >
                        <div>
                            <div className="flex items-center justify-between">
                                <label
                                    htmlFor="email"
                                    className="block cursor-pointer text-sm/6 font-medium text-gray-900"
                                >
                                    Email adress
                                </label>

                                {mode === 'retrieve_password' && <div
                                    className="text-sm cursor-pointer font-semibold text-indigo-500 hover:text-indigo-700"
                                    onClick={() => setMode('login')}
                                >
                                    Remember password?
                                </div>}
                            </div>

                            <div className="mt-2">
                                <input
                                    type="email"
                                    name="email"
                                    id="email"
                                    required
                                    value={email}
                                    placeholder="Your email adress"
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                                />
                            </div>
                        </div>

                        {mode === 'login' && <div>
                            <div className="flex items-center justify-between">
                                <label
                                    htmlFor="password"
                                    className="block text-sm/6 font-medium text-gray-900"
                                >
                                    Password
                                </label>

                                <div
                                    className="text-sm cursor-pointer font-semibold text-indigo-500 hover:text-indigo-700"
                                    onClick={() => setMode('retrieve_password')}
                                >
                                    Forgot password?
                                </div>
                            </div>

                            <div className="mt-2">
                                <input
                                    type="password"
                                    name="password"
                                    id="password"
                                    autoComplete="current-password"
                                    required
                                    placeholder="Your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                                />
                            </div>
                        </div>}

                        {mode === 'login' && <SiteCheckbox
                            id="remember-me"
                            disabled={false}
                            label="Remember me"
                            modelValue={rememberMe}
                            onUpdate={setRememberMe}
                        />}

                        <div>
                            <button
                                type="submit"
                                className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                            >
                                {mode === 'login' ? "Sign in" : "Reset password"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
};

export default LoginPage;
