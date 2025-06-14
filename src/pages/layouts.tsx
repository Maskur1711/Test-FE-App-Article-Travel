import { Outlet } from "react-router-dom";
import Navbar from "@/components/nav/Navbar";

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <main>
        <Outlet />
      </main>
    </div>
  );
}
