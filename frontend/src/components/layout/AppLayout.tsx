import { Outlet } from "react-router-dom";

import Sidebar from "./Sidebar";
import TopBar from "./TopBar";

export default function AppLayout() {
    return (
        <div className="min-h-screen bg-black pb-16 md:pb-0">
            <Sidebar />

            <div className="min-w-0">
                <TopBar />

                <main className="min-w-0 md:ml-60">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}