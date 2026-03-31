import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/layouts/AdminLayout";
import { Plus, X, Megaphone } from "lucide-react";
import { formatDate } from "@/lib/format";
import { CardSkeleton } from "@/components/ui/CardSkeleton";
import { EmptyState } from "@/components/ui/EmptyState";

export default function AdminAnnouncements() {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ message: "", target_role: "all" });

  const fetchData = async () => {
    const { data } = await supabase.from("announcements").select("*").order("created_at", { ascending: false });
    setAnnouncements(data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    await supabase.from("announcements").insert({ message: form.message, target_role: form.target_role });
    setShowModal(false);
    setForm({ message: "", target_role: "all" });
    fetchData();
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground">Announcements</h2>
          <button onClick={() => setShowModal(true)} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
            <Plus size={16} />New Announcement
          </button>
        </div>

        {loading ? <CardSkeleton count={3} /> : announcements.length === 0 ? (
          <EmptyState title="No announcements" description="Create your first announcement to notify parents or teachers." icon={Megaphone} />
        ) : (
          <div className="space-y-3">
            {announcements.map((a) => (
              <div key={a.id} className="rounded-xl border border-border bg-card p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary capitalize">{a.target_role}</span>
                  <span className="text-xs text-muted-foreground">{formatDate(a.created_at)}</span>
                </div>
                <p className="text-sm text-foreground">{a.message}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <>
          <div className="fixed inset-0 z-40 bg-background/60" onClick={() => setShowModal(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-lg rounded-xl border border-border bg-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">New Announcement</h3>
                <button onClick={() => setShowModal(false)}><X className="h-5 w-5 text-muted-foreground" /></button>
              </div>
              <form onSubmit={handleAdd} className="space-y-4">
                <select value={form.target_role} onChange={(e) => setForm({ ...form, target_role: e.target.value })} className="w-full rounded-lg border border-border bg-muted px-4 py-2 text-sm text-foreground focus:border-primary focus:outline-none">
                  <option value="all">Everyone</option>
                  <option value="parent">Parents Only</option>
                  <option value="teacher">Teachers Only</option>
                </select>
                <textarea placeholder="Type your announcement..." value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} rows={4} required className="w-full rounded-lg border border-border bg-muted px-4 py-2 text-sm text-foreground focus:border-primary focus:outline-none" />
                <button type="submit" className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90">Send Announcement</button>
              </form>
            </div>
          </div>
        </>
      )}
    </AdminLayout>
  );
}
