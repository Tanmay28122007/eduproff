import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";

import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Student from "./pages/Student";
import Verify from "./pages/Verify";
import GenerateCV from "./pages/GenerateCV";
import UploadSuccess from "./pages/UploadSuccess";
import UploadFailed from "./pages/UploadFailed";
import Support from "./pages/Support";
import Careers from "./pages/Careers";
import PublicVerify from "./pages/PublicVerify";
import HowItWorks from "./pages/HowItWorks";
import Demo from "./pages/Demo";
import About from "./pages/About";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import NotFound from "./pages/NotFound";
import RecruiterDashboard from "./pages/recruiter/RecruiterDashboard";
import RecruiterOverview from "./pages/recruiter/RecruiterOverview";
import RecruiterVerify from "./pages/recruiter/RecruiterVerify";
import RecruiterHistory from "./pages/recruiter/RecruiterHistory";
import CandidateProfile from "./pages/recruiter/CandidateProfile";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminOverview from "./pages/admin/AdminOverview";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminCandidates from "./pages/admin/AdminCandidates";
import AdminRecruiters from "./pages/admin/AdminRecruiters";
import AdminCertificates from "./pages/admin/AdminCertificates";
import AdminActivity from "./pages/admin/AdminActivity";
import AdminFlaggedReports from "./pages/admin/AdminFlaggedReports";
import AdminMessaging from "./pages/admin/AdminMessaging";
import AdminChatbot from "./pages/admin/AdminChatbot";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AuthProvider>

            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/login" element={<Auth />} />
              <Route path="/signup" element={<Auth />} />
              <Route path="/how-it-works" element={<HowItWorks />} />
              <Route path="/demo" element={<Demo />} />
              <Route path="/about" element={<About />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              <Route 
                path="/student" 
                element={
                  <ProtectedRoute allowedRoles={["candidate"]}>
                    <Student />
                  </ProtectedRoute>
                } 
              />
              <Route
                path="/recruiter"
                element={
                  <ProtectedRoute allowedRoles={["recruiter"]}>
                    <RecruiterDashboard />
                  </ProtectedRoute>
                }
              >
                <Route index element={<RecruiterOverview />} />
                <Route path="candidate/:candidateId" element={<CandidateProfile />} />
              </Route>
              <Route 
                path="/verify" 
                element={
                  <ProtectedRoute allowedRoles={["candidate"]}>
                    <Verify />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/upload-success" 
                element={
                  <ProtectedRoute allowedRoles={["candidate"]}>
                    <UploadSuccess />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/upload-failed" 
                element={
                  <ProtectedRoute allowedRoles={["candidate"]}>
                    <UploadFailed />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/generate-cv" 
                element={
                  <ProtectedRoute allowedRoles={["candidate"]}>
                    <GenerateCV />
                  </ProtectedRoute>
                } 
              />
              <Route path="/support" element={<Support />} />
              <Route path="/careers" element={<Careers />} />
              <Route path="/check" element={<PublicVerify />} />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              >
                <Route index element={<AdminOverview />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="candidates" element={<AdminCandidates />} />
                <Route path="recruiters" element={<AdminRecruiters />} />
                <Route path="certificates" element={<AdminCertificates />} />
                <Route path="activity" element={<AdminActivity />} />
                <Route path="flagged" element={<AdminFlaggedReports />} />
                <Route path="messaging" element={<AdminMessaging />} />
                <Route path="chatbot" element={<AdminChatbot />} />
              </Route>
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
