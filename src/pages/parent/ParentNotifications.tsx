import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ParentLayout } from "@/components/layouts/ParentLayout";
import { Bell } from "lucide-react";
import { formatDate } from "@/lib/format";
import { CardSkeleton } from "@/components/ui/CardSkeleton";
import { EmptyState } from "@/components/ui/EmptyState";

export default function ParentNotifications() {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("announcements").select("*").in("target_role", ["parent", "all"]).order("created_at", { ascending: false })
      .then(({ data }) => { setAnnouncements(data ?? []); setLoading(false); });
  }, []);

  return (
    <ParentLayout>
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-foreground">Notifications</h2>
        {loading ? <CardSkeleton count={3} /> : announcements.length === 0 ? (
          <EmptyState title="No notifications" description="Announcements from admin will appear here." icon={Bell} />
        ) : (
          <div className="space-y-3">
            {announcements.map((a) => (
              <div key={a.id} className="active-gold-border rounded-xl border border-border bg-card p-5">
                <p className="text-xs text-muted-foreground mb-2">{formatDate(a.created_at)}</p>
                <p className="text-sm text-foreground leading-relaxed">{a.message}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </ParentLayout>
  );
}
