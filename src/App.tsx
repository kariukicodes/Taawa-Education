import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Unauthorized from "./pages/Unauthorized";
import NotFound from "./pages/NotFound";
// Admin
import AdminOverview from "./pages/admin/AdminOverview";
import AdminLeads from "./pages/admin/AdminLeads";
import AdminStudents from "./pages/admin/AdminStudents";
import AdminParents from "./pages/admin/AdminParents";
import AdminTutors from "./pages/admin/AdminTutors";
import AdminAssignments from "./pages/admin/AdminAssignments";
import AdminReports from "./pages/admin/AdminReports";
import AdminPayments from "./pages/admin/AdminPayments";
import AdminTasks from "./pages/admin/AdminTasks";
import AdminAnnouncements from "./pages/admin/AdminAnnouncements";
// Parent
import ParentOverview from "./pages/parent/ParentOverview";
import ParentChildren from "./pages/parent/ParentChildren";
import ParentSchedule from "./pages/parent/ParentSchedule";
import ParentReports from "./pages/parent/ParentReports";
import ParentAttendance from "./pages/parent/ParentAttendance";
import ParentDocuments from "./pages/parent/ParentDocuments";
import ParentBilling from "./pages/parent/ParentBilling";
import ParentNotifications from "./pages/parent/ParentNotifications";
import ParentMessages from "./pages/parent/ParentMessages";
// Teacher
import TeacherOverview from "./pages/teacher/TeacherOverview";
import TeacherStudents from "./pages/teacher/TeacherStudents";
import TeacherSchedule from "./pages/teacher/TeacherSchedule";
import TeacherMessages from "./pages/teacher/TeacherMessages";
import TeacherLessons from "./pages/teacher/TeacherLessons";
import TeacherAttendance from "./pages/teacher/TeacherAttendance";
import TeacherTasks from "./pages/teacher/TeacherTasks";
import TeacherEarnings from "./pages/teacher/TeacherEarnings";
import TeacherNotifications from "./pages/teacher/TeacherNotifications";
import TutorsPage from "@/pages/tutors";
import AboutPage from "@/pages/AboutPage";
import ProgramsPage from "@/pages/ProgramsPage";
import PlaceholderPage from "@/pages/PlaceholderPage";
import {
  AdmissionsPolicyPage,
  ChildProtectionPolicyPage,
  FeesPolicyPage,
  PrivacyPolicyPage,
  TermsPage,
} from "@/pages/LegalPages";
import { ContactModalProvider } from "@/components/landing/ContactModalContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <ContactModalProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/unauthorized" element={<Unauthorized />} />

              {/* Admin */}
              <Route path="/admin" element={<ProtectedRoute requiredRole="admin"><AdminOverview /></ProtectedRoute>} />
              <Route path="/admin/leads" element={<ProtectedRoute requiredRole="admin"><AdminLeads /></ProtectedRoute>} />
              <Route path="/admin/students" element={<ProtectedRoute requiredRole="admin"><AdminStudents /></ProtectedRoute>} />
              <Route path="/admin/parents" element={<ProtectedRoute requiredRole="admin"><AdminParents /></ProtectedRoute>} />
              <Route path="/admin/tutors" element={<ProtectedRoute requiredRole="admin"><AdminTutors /></ProtectedRoute>} />
              <Route path="/admin/assignments" element={<ProtectedRoute requiredRole="admin"><AdminAssignments /></ProtectedRoute>} />
              <Route path="/admin/reports" element={<ProtectedRoute requiredRole="admin"><AdminReports /></ProtectedRoute>} />
              <Route path="/admin/payments" element={<ProtectedRoute requiredRole="admin"><AdminPayments /></ProtectedRoute>} />
              <Route path="/admin/tasks" element={<ProtectedRoute requiredRole="admin"><AdminTasks /></ProtectedRoute>} />
              <Route path="/admin/announcements" element={<ProtectedRoute requiredRole="admin"><AdminAnnouncements /></ProtectedRoute>} />

              {/* Parent */}
              <Route path="/parent" element={<ProtectedRoute requiredRole="parent"><ParentOverview /></ProtectedRoute>} />
              <Route path="/parent/children" element={<ProtectedRoute requiredRole="parent"><ParentChildren /></ProtectedRoute>} />
              <Route path="/parent/schedule" element={<ProtectedRoute requiredRole="parent"><ParentSchedule /></ProtectedRoute>} />
              <Route path="/parent/messages" element={<ProtectedRoute requiredRole="parent"><ParentMessages /></ProtectedRoute>} />
              <Route path="/parent/reports" element={<ProtectedRoute requiredRole="parent"><ParentReports /></ProtectedRoute>} />
              <Route path="/parent/attendance" element={<ProtectedRoute requiredRole="parent"><ParentAttendance /></ProtectedRoute>} />
              <Route path="/parent/documents" element={<ProtectedRoute requiredRole="parent"><ParentDocuments /></ProtectedRoute>} />
              <Route path="/parent/billing" element={<ProtectedRoute requiredRole="parent"><ParentBilling /></ProtectedRoute>} />
              <Route path="/parent/notifications" element={<ProtectedRoute requiredRole="parent"><ParentNotifications /></ProtectedRoute>} />

              {/* Teacher */}
              <Route path="/teacher" element={<ProtectedRoute requiredRole="teacher"><TeacherOverview /></ProtectedRoute>} />
              <Route path="/teacher/students" element={<ProtectedRoute requiredRole="teacher"><TeacherStudents /></ProtectedRoute>} />
              <Route path="/teacher/schedule" element={<ProtectedRoute requiredRole="teacher"><TeacherSchedule /></ProtectedRoute>} />
              <Route path="/teacher/messages" element={<ProtectedRoute requiredRole="teacher"><TeacherMessages /></ProtectedRoute>} />
              <Route path="/teacher/lessons" element={<ProtectedRoute requiredRole="teacher"><TeacherLessons /></ProtectedRoute>} />
              <Route path="/teacher/attendance" element={<ProtectedRoute requiredRole="teacher"><TeacherAttendance /></ProtectedRoute>} />
              <Route path="/teacher/tasks" element={<ProtectedRoute requiredRole="teacher"><TeacherTasks /></ProtectedRoute>} />
              <Route path="/teacher/earnings" element={<ProtectedRoute requiredRole="teacher"><TeacherEarnings /></ProtectedRoute>} />
              <Route path="/teacher/notifications" element={<ProtectedRoute requiredRole="teacher"><TeacherNotifications /></ProtectedRoute>} />
              <Route path="/tutors" element={<TutorsPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/programs" element={<ProgramsPage />} />

              {/* Placeholder Pages */}
              <Route path="/fees" element={<PlaceholderPage title="Fees" />} />
              <Route path="/careers" element={<PlaceholderPage title="Careers" />} />
              <Route path="/contact" element={<PlaceholderPage title="Contact Us" />} />
              <Route path="/resources" element={<PlaceholderPage title="Resources" />} />
              <Route path="/tutors/guide" element={<PlaceholderPage title="Tutor Guidelines" />} />
              <Route path="/policy/fees" element={<FeesPolicyPage />} />
              <Route path="/policy/admissions" element={<AdmissionsPolicyPage />} />
              <Route path="/policy/child-protection" element={<ChildProtectionPolicyPage />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/privacy" element={<PrivacyPolicyPage />} />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </ContactModalProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
