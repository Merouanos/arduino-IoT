import {
    BrowserRouter,
    Navigate,
    Route,
    Routes,
} from "react-router-dom";

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import DevicesPage from "./pages/DevicesPage";
import AccountPage from "./pages/AccountPage";
import ReadingsPage from "./pages/ReadingsPage";
import AlertsPage from "./pages/AlertsPage";
import ActivityPage from "./pages/ActivityPage";

import {
    ProtectedRoute,
    PublicOnlyRoute,
} from "./components/ProtectedRoute";

import AppLayout from "./components/layout/AppLayout";
import { DeviceProvider } from "./context/DeviceContext";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route element={<PublicOnlyRoute />}>
                    <Route
                        path="/login"
                        element={<LoginPage />}
                    />

                    <Route
                        path="/register"
                        element={<RegisterPage />}
                    />
                </Route>

                <Route
                    element={<ProtectedRoute />}
                >
                    <Route
                        element={
                            <DeviceProvider>
                                <AppLayout />
                            </DeviceProvider>
                        }
                    >
                        <Route
                            path="/dashboard"
                            element={
                                <DashboardPage />
                            }
                        />

                        <Route
                            path="/devices"
                            element={
                                <DevicesPage />
                            }
                        />

                        <Route
                            path="/activity"
                            element={<ActivityPage />}
                        />

                        <Route
                            path="/account"
                            element={<AccountPage />}
                        />

                        <Route
                            path="/readings"
                            element={<ReadingsPage />}
                        />

                        <Route
                            path="/alerts"
                            element={<AlertsPage />}
                        />
                    </Route>
                </Route>

                <Route
                    path="*"
                    element={<Navigate to="/dashboard" replace />}
                />
            </Routes>
        </BrowserRouter>
    );
}

export default App;