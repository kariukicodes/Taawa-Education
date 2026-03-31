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
import ParentOverview from "./pages/parent/ParentOverview";
import TeacherOverview from "./pages/teacher/TeacherOverview";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/unauthorized" element={<Unauthorized />} />

            {/* Admin routes */}
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

            {/* Parent routes */}
            <Route path="/parent" element={<ProtectedRoute requiredRole="parent"><ParentOverview /></ProtectedRoute>} />
            <Route path="/parent/*" element={<ProtectedRoute requiredRole="parent"><ParentOverview /></ProtectedRoute>} />

            {/* Teacher routes */}
            <Route path="/teacher" element={<ProtectedRoute requiredRole="teacher"><TeacherOverview /></ProtectedRoute>} />
            <Route path="/teacher/*" element={<ProtectedRoute requiredRole="teacher"><TeacherOverview /></ProtectedRoute>} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
