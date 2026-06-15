import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Bell,
  CreditCard,
  FileText,
  GitBranch,
  GraduationCap,
  LayoutDashboard,
  ListTodo,
  LogOut,
  Megaphone,
  Sparkles,
  UserCheck,
  UserCircle,
  Users,
} from "lucide-react";

import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
} from "@/components/ui/sidebar";

const adminLinks = [
  { label: "Overview", path: "/admin", icon: LayoutDashboard },
  { label: "Leads", path: "/admin/leads", icon: Users },
  { label: "Students", path: "/admin/students", icon: GraduationCap },
  { label: "Parents", path: "/admin/parents", icon: UserCircle },
  { label: "Tutors", path: "/admin/tutors", icon: UserCheck },
  { label: "Assignments", path: "/admin/assignments", icon: GitBranch },
  { label: "Reports", path: "/admin/reports", icon: FileText },
  { label: "Payments", path: "/admin/payments", icon: CreditCard },
  { label: "Tasks", path: "/admin/tasks", icon: ListTodo },
  { label: "Announcements", path: "/admin/announcements", icon: Megaphone },
] as const;

function getInitials(value?: string | null) {
  if (!value) return "AD";
  const cleanValue = value.includes("@") ? value.split("@")[0] : value;
  const parts = cleanValue.split(/[.\s_-]+/).filter(Boolean);

  if (parts.length === 0) return "AD";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();

  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

export function AdminLayout({ children }: { children: ReactNode }) {
  const { signOut, user } = useAuth();
  const location = useLocation();

  const currentPage =
    adminLinks.find((link) => location.pathname === link.path) ?? adminLinks[0];
  const userLabel = user?.email ?? "admin@edunest.co";

  return (
    <SidebarProvider defaultOpen>
      <Sidebar collapsible="icon" className="border-r border-sidebar-border/70">
        <SidebarHeader className="gap-4 px-3 py-4">
          <div className="flex items-center justify-between gap-3 rounded-xl border border-sidebar-border/70 bg-sidebar-accent/70 px-3 py-3">
            <div className="min-w-0">
              <Link to="/admin" className="block text-base font-semibold text-sidebar-accent-foreground">
                Edu<span className="text-primary">Nest</span>
              </Link>
              <p className="truncate text-xs text-sidebar-foreground">
                Operations command center
              </p>
            </div>
            <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary">
              Admin
            </Badge>
          </div>

          <div className="rounded-xl border border-sidebar-border/70 bg-gradient-to-br from-primary/10 via-transparent to-transparent px-3 py-3">
            <div className="flex items-center gap-2 text-sm font-medium text-sidebar-accent-foreground">
              <Sparkles className="h-4 w-4 text-primary" />
              Daily focus
            </div>
            <p className="mt-1 text-xs leading-5 text-sidebar-foreground">
              Review new leads, unblock payments, and keep tutor assignments moving.
            </p>
          </div>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Workspace</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminLinks.map((link) => {
                  const active = location.pathname === link.path;

                  return (
                    <SidebarMenuItem key={link.path}>
                      <SidebarMenuButton
                        asChild
                        isActive={active}
                        tooltip={link.label}
                        className={active ? "shadow-[0_0_0_1px_hsl(var(--primary)/0.25)]" : ""}
                      >
                        <Link to={link.path}>
                          <link.icon className="h-4 w-4" />
                          <span>{link.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarSeparator />

        <SidebarFooter className="px-3 pb-3 pt-2">
          <div className="rounded-xl border border-sidebar-border/70 bg-sidebar-accent/70 p-3 group-data-[collapsible=icon]:p-2">
            <div className="flex items-center gap-3 group-data-[collapsible=icon]:justify-center">
              <Avatar className="h-10 w-10 border border-primary/20">
                <AvatarFallback className="bg-primary/15 text-xs font-semibold text-primary">
                  {getInitials(userLabel)}
                </AvatarFallback>
              </Avatar>

              <div className="min-w-0 group-data-[collapsible=icon]:hidden">
                <p className="truncate text-sm font-medium text-sidebar-accent-foreground">
                  Admin user
                </p>
                <p className="truncate text-xs text-sidebar-foreground">{userLabel}</p>
              </div>
            </div>

            <Button
              variant="ghost"
              className="mt-3 w-full justify-start text-sidebar-foreground hover:bg-sidebar hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:mt-2 group-data-[collapsible=icon]:justify-center"
              onClick={signOut}
            >
              <LogOut className="h-4 w-4" />
              <span className="group-data-[collapsible=icon]:hidden">Sign out</span>
            </Button>
          </div>
        </SidebarFooter>

        <SidebarRail />
      </Sidebar>

      <SidebarInset className="bg-[radial-gradient(circle_at_top,hsla(43,50%,54%,0.08),transparent_28%),hsl(var(--background))]">
        <header className="sticky top-0 z-20 border-b border-border/70 bg-background/85 backdrop-blur">
          <div className="flex h-16 items-center justify-between gap-4 px-4 md:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <SidebarTrigger className="h-9 w-9 rounded-lg border border-border/70" />
              <Separator orientation="vertical" className="hidden h-6 md:block" />
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  Admin dashboard
                </p>
                <h1 className="truncate text-base font-semibold text-foreground">
                  {currentPage.label}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2 md:gap-3">
              <Badge
                variant="outline"
                className="hidden border-border/70 bg-card/70 px-3 py-1 text-[11px] text-muted-foreground md:inline-flex"
              >
                Ctrl/Cmd + B
              </Badge>

              <Button variant="ghost" size="icon" className="rounded-full border border-border/70">
                <Bell className="h-4 w-4" />
                <span className="sr-only">Notifications</span>
              </Button>

              <Avatar className="h-9 w-9 border border-border/70">
                <AvatarFallback className="bg-muted text-xs font-semibold text-foreground">
                  {getInitials(userLabel)}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 md:px-6 md:py-8">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
