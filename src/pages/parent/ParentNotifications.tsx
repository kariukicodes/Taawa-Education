import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ParentLayout } from "@/components/layouts/ParentLayout";

export default function ParentNotifications() {
  const [announcements, setAnnouncements] = useState<any[]>([]);

  useEffect(() => {
    supabase.from("announcements").select("*").in("target_role", ["parent", "all"]).order("created_at", { ascending: false })
      .then(({ data }) => setAnnouncements(data ?? []));
  }, []);

  return (
    <ParentLayout>
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-foreground">Notifications</h2>
        <div className="space-y-3">
          {announcements.map((a) => (
            <div key={a.id} className="active-gold-border rounded-xl border border-border bg-card p-5">
              <p className="text-xs text-muted-foreground mb-2">{new Date(a.created_at).toLocaleDateString("en-GB")}</p>
              <p className="text-sm text-foreground leading-relaxed">{a.message}</p>
            </div>
          ))}
          {announcements.length === 0 && <p className="text-muted-foreground">No notifications.</p>}
        </div>
      </div>
    </ParentLayout>
  );
}
