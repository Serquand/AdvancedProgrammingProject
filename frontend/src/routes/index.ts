import AnswersPage from "../pages/AnswersPage";
import Filled from "../pages/Filled";
import FillForm from "../pages/FillForm";
import FormEditionPage from "../pages/FormEditionPage";
import FormsPage from "../pages/Forms";
import OrganizationPage from "../pages/Organization";
import ReviewForm from "../pages/ReviewForm";
import ToFillPage from "../pages/ToFill";
import UsersPage from "../pages/UsersPage";
import { Roles } from "../utils/types";

export default [
    {
        path: "to-fill",
        component: ToFillPage,
        roles: [Roles.STUDENT],
    },
    {
        path: "filled",
        component: Filled,
        roles: [Roles.STUDENT],
    },
    {
        path: "form/:id/fill",
        component: FillForm,
        roles: [Roles.STUDENT],
    },
    {
        path: "form/:id/review",
        component: ReviewForm,
        roles: [Roles.STUDENT],
    },
    {
        path: "organization",
        component: OrganizationPage,
        roles: [Roles.ADMIN],
    },
    {
        path: "forms",
        component: FormsPage,
        roles: [Roles.ADMIN, Roles.TEACHER],
    },
    {
        path: "form/:id/answers",
        component: AnswersPage,
        roles: [Roles.ADMIN, Roles.TEACHER],
    },
    {
        path: "form/:id/edition",
        component: FormEditionPage,
        roles: [Roles.ADMIN],
    },
    {
        path: "users",
        component: UsersPage,
        roles: [Roles.ADMIN],
    },
];
