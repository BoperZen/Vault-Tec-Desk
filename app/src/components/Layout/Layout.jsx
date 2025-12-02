import { Outlet } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import Header from "./Header";
import { NotificationProvider, useNotification } from "@/context/NotificationContext";
import Notification from "@/components/ui/Notification";

function MainContent() {
  const { notification } = useNotification();
  
  return (
    <div className="flex flex-1 flex-col min-w-0">
      <Header />
      <Notification />
      <main 
        className="flex-1 overflow-y-auto bg-background px-6 transition-all duration-300"
        style={{ paddingTop: notification ? '156px' : '100px' }}
      >
        <Outlet />
      </main>
    </div>
  );
}

export function Layout() {
  return (
    <NotificationProvider>
      <SidebarProvider>
        <div className="relative flex min-h-screen w-full overflow-x-hidden">
          <AppSidebar />
          <MainContent />
        </div>
      </SidebarProvider>
    </NotificationProvider>
  );
}
