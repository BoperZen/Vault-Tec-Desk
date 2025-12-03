import { Outlet } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { Footer } from "./Footer";
import Header from "./Header";
import { NotificationProvider, useNotification } from "@/context/NotificationContext";
import { FullscreenProvider, useFullscreen } from "@/context/FullscreenContext";
import Notification from "@/components/ui/Notification";

function MainContent() {
  const { notification } = useNotification();
  const { isFullscreen } = useFullscreen();
  
  // Calcular paddingTop basado en fullscreen y notificación
  const basePadding = isFullscreen ? 108 : 100;
  const notificationPadding = notification ? 56 : 0;
  const totalPadding = basePadding + notificationPadding;
  
  return (
    <div className="flex flex-1 flex-col min-w-0">
      <Header />
      <Notification />
      <main 
        className="flex-1 overflow-y-auto bg-background px-6 pb-12 transition-all duration-300"
        style={{ paddingTop: `${totalPadding}px` }}
      >
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export function Layout() {
  return (
    <NotificationProvider>
      <FullscreenProvider>
        <SidebarProvider>
          <div className="relative flex min-h-screen w-full overflow-x-hidden">
            <AppSidebar />
            <MainContent />
          </div>
        </SidebarProvider>
      </FullscreenProvider>
    </NotificationProvider>
  );
}
