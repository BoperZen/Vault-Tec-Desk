import { Outlet } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import Header from "./Header";

export function Layout() {
  return (
    <SidebarProvider>
      <div className="relative flex min-h-screen w-full overflow-x-hidden">
        <AppSidebar />
        <div className="flex flex-1 flex-col min-w-0">
          <Header />
          <main className="flex-1 overflow-y-auto bg-background px-6 pt-[100px]">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
