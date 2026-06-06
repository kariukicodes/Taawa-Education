import { ReactNode, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  LayoutDashboard, Users, Calendar, PenTool, ClipboardCheck,
  ListTodo, DollarSign, Bell, LogOut, Menu, X, MessageSquare
} from "lucide-react";

const teacherLinks = [
  { label: "Overview", path: "/teacher", icon: LayoutDashboard },
  { label: "My Students", path: "/teacher/students", icon: Users },
  { label: "Schedule", path: "/teacher/schedule", icon: Calendar },
  { label: "Messages", path: "/teacher/messages", icon: MessageSquare },
  { label: "Lesson Log", path: "/teacher/lessons", icon: PenTool },
  { label: "Attendance", path: "/teacher/attendance", icon: ClipboardCheck },
  { label: "Tasks", path: "/teacher/tasks", icon: ListTodo },
  { label: "Earnings", path: "/teacher/earnings", icon: DollarSign },
  { label: "Notifications", path: "/teacher/notifications", icon: Bell },
];

export function TeacherLayout({ children }: { children: ReactNode }) {
  const { signOut } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-background">
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-background/80 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 border-r border-border bg-sidebar transform transition-transform lg:static lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex h-14 items-center justify-between border-b border-border px-6">
          <Link to="/teacher" className="text-lg font-bold text-foreground">Edu<span className="text-primary">Nest</span></Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-muted-foreground"><X size={20} /></button>
        </div>
        <div className="px-3 py-4">
          <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Teacher Portal</p>
          <nav className="space-y-1">
            {teacherLinks.map((link) => {
              const active = location.pathname === link.path;
              return (
                <Link key={link.path} to={link.path} onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${active ? "active-gold-border bg-sidebar-accent text-foreground font-medium" : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-foreground"}`}>
                  <link.icon size={18} />{link.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="absolute bottom-0 left-0 right-0 border-t border-border p-3">
          <button onClick={signOut} className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-foreground">
            <LogOut size={18} />Sign Out
          </button>
        </div>
      </aside>
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b border-border bg-background px-6">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-foreground"><Menu size={20} /></button>
          <h1 className="text-sm font-medium text-muted-foreground">Teacher Portal</h1>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
