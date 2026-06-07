import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Calendar, Mail, MessageCircle, Video } from "lucide-react";

import { ParentLayout } from "@/components/layouts/ParentLayout";
import { CardSkeleton } from "@/components/ui/CardSkeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { useAuth } from "@/contexts/AuthContext";
import { buildMailtoLink, buildWhatsAppLink } from "@/lib/contactLinks";
import { getDemoParentChildren } from "@/lib/demoPortalData";
import { formatDate } from "@/lib/format";
import { invokeSupabaseFunction } from "@/lib/invokeSupabaseFunction";
import { reportClientError } from "@/lib/reportClientError";
import {
  formatSessionReminder,
  formatSessionSchedule,
  hasSessionSchedule,
} from "@/lib/sessionSchedule";
import { toast } from "@/hooks/use-toast";

type ParentDashboardResponse = {
  children: Array<{
    id: string;
    full_name: string;
    grade: string | null;
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

export default function ParentSchedule() {
  const { user, roleOverride, loading: authLoading } = useAuth();
  const [children, setChildren] = useState<ParentDashboardResponse["children"]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const isDemo =
    import.meta.env.DEV &&
    import.meta.env.VITE_ENABLE_DEMO_MODE === "true" &&
    roleOverride === "parent";

  useEffect(() => {
    if (authLoading) return;
    if (!isDemo && !user) return;

    const fetchSchedule = async () => {
      setLoading(true);
      setLoadError(null);

      if (isDemo) {
        setChildren(getDemoParentChildren());
        setLoading(false);
        return;
      }

      try {
        const data = await invokeSupabaseFunction<ParentDashboardResponse>(
          "get-parent-dashboard",
          undefined,
        );
        setChildren(data.children ?? []);
      } catch (err) {
        reportClientError("ParentSchedule.fetchSchedule", err);
        const message = err instanceof Error ? err.message : String(err);
        setLoadError(message);
        toast({
          title: "Failed to load online sessions",
          description: message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    void fetchSchedule();
  }, [authLoading, isDemo, user?.id]);

  const sessions = children.filter(
    (child) => child.meeting_link || hasSessionSchedule(child),
  );

  return (
    <ParentLayout>
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-foreground">Online Sessions</h2>

        {loading ? (
          <CardSkeleton count={4} />
        ) : loadError ? (
          <EmptyState title="Sessions unavailable" description={loadError} icon={Calendar} />
        ) : sessions.length === 0 ? (
          <EmptyState
            title="No sessions scheduled yet"
            description="Ask your tutor or admin team to add the recurring lesson schedule."
            icon={Video}
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {sessions.map((session) => (
              <div key={session.id} className="rounded-xl border border-border bg-card p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-foreground">{session.full_name}</p>
                    <p className="text-sm text-muted-foreground">
                      Grade {session.grade ?? "-"} | Started{" "}
                      {session.start_date ? formatDate(session.start_date) : "recently"}
                    </p>
                  </div>
                  <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                    {(session.meeting_provider ?? "custom").replace("_", " ")}
                  </span>
                </div>

                <p className="mt-3 text-sm text-muted-foreground">
                  Tutor: {session.tutor?.full_name ?? "Not assigned"}
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  <Link
                    to={`/parent/messages?student=${session.id}`}
                    className="inline-flex items-center gap-1 rounded-lg border border-primary/30 bg-primary/10 px-3 py-2 text-xs font-medium text-primary hover:bg-primary/15"
                  >
                    <MessageCircle className="h-3.5 w-3.5" />
                    In-App Chat
                  </Link>
                  {session.meeting_link ? (
                    <a
                      href={session.meeting_link}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90"
                    >
                      <Video className="h-3.5 w-3.5" />
                      Join Session
                    </a>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-xs font-medium text-muted-foreground">
                      <Video className="h-3.5 w-3.5" />
                      Meeting Link Pending
                    </span>
                  )}
                  {session.tutor?.phone && (
                    <a
                      href={buildWhatsAppLink(
                        session.tutor.phone,
                        `Hello ${session.tutor.full_name}, I'm checking in about ${session.full_name}'s online class.`,
                      )}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-xs font-medium text-foreground hover:bg-muted"
                    >
                      <MessageCircle className="h-3.5 w-3.5" />
                      Chat with Tutor
                    </a>
                  )}
                  {session.tutor?.email && (
                    <a
                      href={buildMailtoLink(
                        session.tutor.email,
                        `${session.full_name} online session`,
                      )}
                      className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-xs font-medium text-foreground hover:bg-muted"
                    >
                      <Mail className="h-3.5 w-3.5" />
                      Email Tutor
                    </a>
                  )}
                </div>
                <div className="mt-3 text-xs text-muted-foreground">
                  <p>{formatSessionSchedule(session)}</p>
                  <p>{formatSessionReminder(session)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </ParentLayout>
  );
}
