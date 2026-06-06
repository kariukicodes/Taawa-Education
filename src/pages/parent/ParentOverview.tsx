import { useEffect, useState } from "react";
import { BookOpen, CreditCard, Users, Video, ClipboardCheck } from "lucide-react";

import { ParentLayout } from "@/components/layouts/ParentLayout";
import { formatDate, formatKES } from "@/lib/format";
import { KpiSkeleton } from "@/components/ui/KpiSkeleton";
import { CardSkeleton } from "@/components/ui/CardSkeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { useAuth } from "@/contexts/AuthContext";
import { DEMO_DATA } from "@/lib/demoData";
import { invokeSupabaseFunction } from "@/lib/invokeSupabaseFunction";
import { reportClientError } from "@/lib/reportClientError";
import { toast } from "@/hooks/use-toast";

type ParentDashboardResponse = {
  parent: {
    id: string;
    full_name: string;
    phone: string | null;
    status: string;
  };
  stats: {
    childrenCount: number;
    lessonsThisWeek: number;
    attendanceRate: number;
    pendingPayments: number;
    activeMeetingLinks: number;
  };
  children: Array<{
    id: string;
    full_name: string;
    age: number | null;
    grade: string | null;
    curriculum: string | null;
    status: string;
    start_date: string | null;
    meeting_provider: string | null;
    meeting_link: string | null;
    tutor: {
      full_name: string;
      phone: string | null;
      email: string | null;
    } | null;
  }>;
  recentLessons: Array<{
    id: string;
    subject: string;
    date: string;
    comments: string | null;
    performance_rating: string | null;
    students: { full_name: string };
    tutors: { full_name: string };
  }>;
};

export default function ParentOverview() {
  const { user, roleOverride, loading: authLoading } = useAuth();
  const [dashboard, setDashboard] = useState<ParentDashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const isDemo =
    import.meta.env.DEV &&
    import.meta.env.VITE_ENABLE_DEMO_MODE === "true" &&
    roleOverride === "parent";

  useEffect(() => {
    if (authLoading) return;
    if (!isDemo && !user) return;

    const fetchDashboard = async () => {
      setLoading(true);
      setLoadError(null);

      if (isDemo) {
        setDashboard({
          parent: {
            id: "demo-parent",
            full_name: DEMO_DATA.parent.profile.firstName,
            phone: "+254700000000",
            status: "active",
          },
          stats: {
            childrenCount: DEMO_DATA.parent.students.length,
            lessonsThisWeek: DEMO_DATA.parent.overview.stats.lessonsThisWeek,
            attendanceRate: DEMO_DATA.parent.overview.stats.attendanceRate,
            pendingPayments: DEMO_DATA.parent.overview.stats.pendingPayments,
            activeMeetingLinks: 0,
          },
          children: [],
          recentLessons: DEMO_DATA.parent.overview.recentLessons,
        });
        setLoading(false);
        return;
      }

      try {
        const data = await invokeSupabaseFunction<ParentDashboardResponse>(
          "get-parent-dashboard",
          undefined,
        );
        setDashboard(data);
      } catch (err) {
        reportClientError("ParentOverview.fetchDashboard", err);
        const message = err instanceof Error ? err.message : String(err);
        setLoadError(message);
        toast({
          title: "Failed to load parent dashboard",
          description: message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    void fetchDashboard();
  }, [authLoading, isDemo, user?.id]);

  const stats = dashboard?.stats ?? {
    childrenCount: 0,
    lessonsThisWeek: 0,
    attendanceRate: 0,
    pendingPayments: 0,
    activeMeetingLinks: 0,
  };

  const cards = [
    { label: "Children Linked", value: stats.childrenCount, icon: Users },
    { label: "Lessons This Week", value: stats.lessonsThisWeek, icon: BookOpen },
    { label: "Attendance Rate", value: `${stats.attendanceRate}%`, icon: ClipboardCheck },
    { label: "Pending Payments", value: formatKES(stats.pendingPayments), icon: CreditCard },
    { label: "Online Session Links", value: stats.activeMeetingLinks, icon: Video },
  ];

  const ratingColors: Record<string, string> = {
    Excellent: "bg-secondary/20 text-secondary",
    Good: "bg-primary/20 text-primary",
    "Needs Improvement": "bg-destructive/20 text-destructive",
  };

  return (
    <ParentLayout>
      {loadError && !loading ? (
        <EmptyState title="Dashboard unavailable" description={loadError} icon={Users} />
      ) : (
        <div className="space-y-8">
          <h2 className="text-2xl font-bold text-foreground">
            Welcome back, {dashboard?.parent.full_name.split(" ")[0] ?? "Parent"}
          </h2>

          {loading ? (
            <KpiSkeleton />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
              {cards.map((card) => (
                <div key={card.label} className="rounded-xl border border-border bg-card p-5">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">{card.label}</p>
                    <card.icon className="h-5 w-5 text-primary" />
                  </div>
                  <p className="mt-2 text-2xl font-bold text-foreground">{card.value}</p>
                </div>
              ))}
            </div>
          )}

          <div>
            <h3 className="mb-4 text-lg font-semibold text-foreground">Recent Tutor Reports</h3>
            {loading ? (
              <CardSkeleton count={3} />
            ) : dashboard?.recentLessons.length ? (
              <div className="space-y-3">
                {dashboard.recentLessons.map((lesson) => (
                  <div key={lesson.id} className="rounded-xl border border-border bg-card p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="font-medium text-foreground">
                          {lesson.students.full_name} | {lesson.subject}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(lesson.date)} | {lesson.tutors.full_name}
                        </p>
                      </div>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          ratingColors[lesson.performance_rating ?? ""] ?? "bg-muted text-muted-foreground"
                        }`}
                      >
                        {lesson.performance_rating ?? "Unrated"}
                      </span>
                    </div>
                    {lesson.comments && (
                      <p className="mt-2 text-sm text-muted-foreground">{lesson.comments}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                title="No reports yet"
                description="Tutor lesson reports will appear here."
                icon={BookOpen}
              />
            )}
          </div>
        </div>
      )}
    </ParentLayout>
  );
}
