import { useEffect, useState } from "react";
import { Bell } from "lucide-react";

import { ParentLayout } from "@/components/layouts/ParentLayout";
import { formatDate } from "@/lib/format";
import { CardSkeleton } from "@/components/ui/CardSkeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { useAuth } from "@/contexts/AuthContext";
import { DEMO_DATA } from "@/lib/demoData";
import { invokeSupabaseFunction } from "@/lib/invokeSupabaseFunction";
import { reportClientError } from "@/lib/reportClientError";
import { toast } from "@/hooks/use-toast";

type AnnouncementRecord = {
  id: string;
  message: string;
  target_role: string;
  created_at: string;
};

type ParentWorkspaceResponse = {
  announcements: AnnouncementRecord[];
};

export default function ParentNotifications() {
  const { roleOverride, user, loading: authLoading } = useAuth();
  const [announcements, setAnnouncements] = useState<AnnouncementRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const isDemo =
    import.meta.env.DEV &&
    import.meta.env.VITE_ENABLE_DEMO_MODE === "true" &&
    roleOverride === "parent";

  useEffect(() => {
    if (authLoading) return;
    if (!isDemo && !user) return;

    const fetchAnnouncements = async () => {
      setLoading(true);

      try {
        const data = isDemo
          ? {
              announcements: (DEMO_DATA.admin.announcements.announcements as AnnouncementRecord[]).filter(
                (announcement) => ["parent", "all"].includes(announcement.target_role),
              ),
            }
          : await invokeSupabaseFunction<ParentWorkspaceResponse>(
              "get-parent-workspace",
              undefined,
            );

        setAnnouncements(data.announcements ?? []);
      } catch (err) {
        reportClientError("ParentNotifications.fetchAnnouncements", err);
        const message = err instanceof Error ? err.message : String(err);
        toast({
          title: "Failed to load notifications",
          description: message,
          variant: "destructive",
        });
        setAnnouncements([]);
      } finally {
        setLoading(false);
      }
    };

    void fetchAnnouncements();
  }, [authLoading, isDemo, roleOverride, user?.id]);

  return (
    <ParentLayout>
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-foreground">Notifications</h2>
        {loading ? (
          <CardSkeleton count={3} />
        ) : announcements.length === 0 ? (
          <EmptyState
            title="No notifications"
            description="Announcements from admin will appear here."
            icon={Bell}
          />
        ) : (
          <div className="space-y-3">
            {announcements.map((announcement) => (
              <div
                key={announcement.id}
                className="active-gold-border rounded-xl border border-border bg-card p-5"
              >
                <p className="mb-2 text-xs text-muted-foreground">
                  {formatDate(announcement.created_at)}
                </p>
                <p className="text-sm leading-relaxed text-foreground">{announcement.message}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </ParentLayout>
  );
}
