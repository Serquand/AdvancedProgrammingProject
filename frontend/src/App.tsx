import { Route, Routes } from "react-router-dom";
import Layout from "./layouts/DefaultLayout";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./pages/ProtectedRoute";
import RetrievePasswordPage from "./pages/RetrievePassword";
import routes from "./routes";
import { useAuthInitialization } from "./utils/auth";

const App = () => {
    useAuthInitialization();

    return (
        <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/retrieve-password" element={<RetrievePasswordPage />} />
            <Route path="/" element={<Layout />}>
                {routes.map(({ path, component: Component, roles }) => (
                    <Route
                        key={path}
                        path={path}
                        element={
                            <ProtectedRoute allowedRole={roles}>
                                <Component />
                            </ProtectedRoute>
                        }
                    />
                ))}
            </Route>
            <Route path="*" element={<NotFound />} />
        </Routes>
    );
};

export default App;
