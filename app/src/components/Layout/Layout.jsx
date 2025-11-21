import { Outlet } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import Header from "./Header";
import { NotificationProvider } from "@/context/NotificationContext";
import Notification from "@/components/ui/Notification";

export function Layout() {
  return (
    <NotificationProvider>
      <SidebarProvider>
        <div className="relative flex min-h-screen w-full overflow-x-hidden">
          <AppSidebar />
          <div className="flex flex-1 flex-col min-w-0">
            <Header />
            <main className="flex-1 overflow-y-auto bg-background px-6 pt-[100px]">
              <Notification />
              <Outlet />
            </main>
          </div>
        </div>
      </SidebarProvider>
    </NotificationProvider>
  );
}
