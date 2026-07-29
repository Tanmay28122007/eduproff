import { Outlet } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { RecruiterSidebar } from "@/components/recruiter/RecruiterSidebar";
import { Layout } from "@/components/layout/Layout";

const RecruiterDashboard = () => {
  return (
    <Layout>
      <SidebarProvider>
        <div className="flex min-h-[calc(100vh-4rem)] w-full">
          <RecruiterSidebar />
          <main className="flex-1 p-6 md:p-10 overflow-auto">
            <Outlet />
          </main>
        </div>
      </SidebarProvider>
    </Layout>
  );
};

export default RecruiterDashboard;
