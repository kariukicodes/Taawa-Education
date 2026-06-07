import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Mail, MessageCircle, Users, Video } from "lucide-react";

import { ParentLayout } from "@/components/layouts/ParentLayout";
import { EmptyState } from "@/components/ui/EmptyState";
import { CardSkeleton } from "@/components/ui/CardSkeleton";
import { useAuth } from "@/contexts/AuthContext";
import { buildMailtoLink, buildWhatsAppLink } from "@/lib/contactLinks";
import { getDemoParentChildren } from "@/lib/demoPortalData";
import { formatDate } from "@/lib/format";
import { invokeSupabaseFunction } from "@/lib/invokeSupabaseFunction";
import { reportClientError } from "@/lib/reportClientError";
import { formatSessionReminder, formatSessionSchedule } from "@/lib/sessionSchedule";
import { toast } from "@/hooks/use-toast";

type ParentDashboardResponse = {
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
    session_day_of_week: number | null;
    session_start_time: string | null;
    session_end_time: string | null;
    session_frequency: "weekly" | "biweekly";
    session_timezone: string | null;
    session_end_date: string | null;
    reminder_enabled: boolean;
    reminder_offset_minutes: number;
    tutor: {
      full_name: string;
      phone: string | null;
      email: string | null;
    } | null;
  }>;
};

export default function ParentChildren() {
  const { user, roleOverride, loading: authLoading } = useAuth();
  const [searchParams] = useSearchParams();
  const [children, setChildren] = useState<ParentDashboardResponse["children"]>([]);
  const [selected, setSelected] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const isDemo =
    import.meta.env.DEV &&
    import.meta.env.VITE_ENABLE_DEMO_MODE === "true" &&
    roleOverride === "parent";

  useEffect(() => {
    if (authLoading) return;
    if (!isDemo && !user) return;

    const fetchChildren = async () => {
      setLoading(true);
      setLoadError(null);

      if (isDemo) {
        setChildren(getDemoParentChildren());
        setSelected(0);
        setLoading(false);
        return;
      }

      try {
        const data = await invokeSupabaseFunction<ParentDashboardResponse>(
          "get-parent-dashboard",
          undefined,
        );
        setChildren(data.children ?? []);
        setSelected(0);
      } catch (err) {
        reportClientError("ParentChildren.fetchChildren", err);
        const message = err instanceof Error ? err.message : String(err);
        setLoadError(message);
        toast({
          title: "Failed to load children",
          description: message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    void fetchChildren();
  }, [authLoading, isDemo, user?.id]);

  const child = children[selected];

  useEffect(() => {
    const requestedStudentId = searchParams.get("student");
    if (!requestedStudentId || children.length === 0) return;

    const nextIndex = children.findIndex((entry) => entry.id === requestedStudentId);
    if (nextIndex >= 0) {
      setSelected(nextIndex);
    }
  }, [children, searchParams]);

  return (
    <ParentLayout>
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-foreground">My Children</h2>

        {loadError && !loading && (
          <EmptyState title="Account setup needed" description={loadError} icon={Users} />
        )}

        {loading ? (
          <CardSkeleton count={1} />
        ) : loadError ? null : children.length === 0 ? (
          <EmptyState
            title="No children linked"
            description="Your children will appear here once assigned by admin."
            icon={Users}
          />
        ) : (
          <>
            {children.length > 1 && (
              <div className="flex flex-wrap gap-2">
                {children.map((entry, index) => (
                  <button
                    key={entry.id}
                    onClick={() => setSelected(index)}
                    className={`rounded-lg px-4 py-2 text-sm font-medium ${
                      selected === index
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {entry.full_name}
                  </button>
                ))}
              </div>
            )}

            {child && (
              <div className="rounded-xl border border-border bg-card p-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/20 text-xl font-bold text-primary">
                    {child.full_name
                      .split(" ")
                      .map((name) => name[0])
                      .join("")}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-foreground">{child.full_name}</h3>
                    <p className="text-muted-foreground">
                      Age {child.age ?? "-"} | Grade {child.grade ?? "-"}
                    </p>
                  </div>
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Curriculum</p>
                    <span className="mt-1 inline-block rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                      {child.curriculum ?? "Not set"}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Assigned Tutor</p>
                    <p className="mt-1 text-foreground">{child.tutor?.full_name ?? "Unassigned"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Online Session</p>
                    <p className="mt-1 text-foreground">
                      {child.meeting_link
                        ? (child.meeting_provider ?? "custom").replace("_", " ")
                        : "No session link yet"}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {formatSessionSchedule(child)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatSessionReminder(child)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Started</p>
                    <p className="mt-1 text-foreground">
                      {child.start_date ? formatDate(child.start_date) : "Not set"}
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-2">
                  <Link
                    to={`/parent/messages?student=${child.id}`}
                    className="inline-flex items-center gap-1 rounded-lg border border-primary/30 bg-primary/10 px-3 py-2 text-xs font-medium text-primary hover:bg-primary/15"
                  >
                    <MessageCircle className="h-3.5 w-3.5" />
                    In-App Chat
                  </Link>
                  {child.tutor?.phone && (
                    <a
                      href={buildWhatsAppLink(
                        child.tutor.phone,
                        `Hello ${child.tutor.full_name}, I'd like to discuss ${child.full_name}'s upcoming lesson.`,
                      )}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-xs font-medium text-foreground hover:bg-muted"
                    >
                      <MessageCircle className="h-3.5 w-3.5" />
                      Chat with Tutor
                    </a>
                  )}
                  {child.tutor?.email && (
                    <a
                      href={buildMailtoLink(
                        child.tutor.email,
                        `${child.full_name} lesson update`,
                      )}
                      className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-xs font-medium text-foreground hover:bg-muted"
                    >
                      <Mail className="h-3.5 w-3.5" />
                      Email Tutor
                    </a>
                  )}
                  {child.meeting_link && (
                    <a
                      href={child.meeting_link}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90"
                    >
                      <Video className="h-3.5 w-3.5" />
                      Join Session
                    </a>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </ParentLayout>
  );
}
