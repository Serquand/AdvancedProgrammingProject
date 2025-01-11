import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Roles, User } from "../utils/types";
import { navigateToDefaultPageForRole } from "../utils/auth";

interface Props {
    allowedRole: Roles[];
    children: JSX.Element;
}

const ProtectedRoute = ({ allowedRole, children }: Props) => {
    const user = useSelector((state: any) => state.user.user) as User | undefined;
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) {
            navigate(`/?rq=${window.location.pathname.substring(1)}`);
        } else if (!allowedRole.includes(user.role)) {
            navigateToDefaultPageForRole(user.role, navigate);
        }
    }, [user, allowedRole, navigate]);

    if (user && allowedRole.includes(user.role)) {
        return <>{children}</>;
    }

    return null;
};

export default ProtectedRoute;
