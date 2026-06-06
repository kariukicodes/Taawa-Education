import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/layouts/AdminLayout";
import { Plus, X, Megaphone } from "lucide-react";
import { formatDate } from "@/lib/format";
import { CardSkeleton } from "@/components/ui/CardSkeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { ConfirmActionDialog } from "@/components/ui/ConfirmActionDialog";
import { useAuth } from "@/contexts/AuthContext";
import { DEMO_DATA } from "@/lib/demoData";
import { toast } from "@/hooks/use-toast";
import { invokeSupabaseFunction } from "@/lib/invokeSupabaseFunction";

export default function AdminAnnouncements() {
  const { roleOverride, loading: authLoading, user } = useAuth();
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<any>(null);
  const [formError, setFormError] = useState("");
  const [form, setForm] = useState({ message: "", target_role: "all" });
  const [pendingDeleteAnnouncement, setPendingDeleteAnnouncement] = useState<any>(null);

  const isDemo =
    import.meta.env.DEV &&
    import.meta.env.VITE_ENABLE_DEMO_MODE === "true" &&
    roleOverride === "admin";

  const fetchData = async () => {
    if (isDemo) {
      setLoading(true);
      setAnnouncements(DEMO_DATA.admin.announcements.announcements);
      setLoading(false);
      return;
    }

    try {
      const { announcements } = await invokeSupabaseFunction<{ announcements: any[] }>(
        "list-announcements-admin",
        undefined,
      );
      setAnnouncements(announcements ?? []);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      toast({
        title: "Failed to load announcements",
        description: message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    if (!isDemo && !user) return;
    void fetchData();
  }, [isDemo, authLoading, user?.id]);

  const closeModal = () => {
    setShowModal(false);
    setEditingAnnouncement(null);
    setForm({ message: "", target_role: "all" });
    setFormError("");
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!form.message.trim()) {
      setFormError("Announcement message is required.");
      return;
    }

    if (isDemo) {
      const demoAnnouncement = {
        id: editingAnnouncement?.id ?? `demo_announcement_${Date.now()}`,
        message: form.message,
        target_role: form.target_role,
        created_at: editingAnnouncement?.created_at ?? new Date().toISOString(),
      };

      setAnnouncements((prev) =>
        editingAnnouncement
          ? prev.map((item) => (item.id === editingAnnouncement.id ? demoAnnouncement : item))
          : [demoAnnouncement, ...prev],
      );
      closeModal();
      return;
    }

    try {
      const { announcement } = await invokeSupabaseFunction<{ announcement: any }>(
        "manage-announcement-admin",
        {
          action: editingAnnouncement ? "update" : "create",
          announcement_id: editingAnnouncement?.id,
          message: form.message,
          target_role: form.target_role,
        },
      );

      setAnnouncements((prev) =>
        editingAnnouncement
          ? prev.map((item) => (item.id === announcement.id ? announcement : item))
          : [announcement, ...prev],
      );

      closeModal();
      toast({
        title: editingAnnouncement ? "Announcement updated" : "Announcement created",
        description: "The announcement was saved successfully.",
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setFormError(message);
      toast({
        title: editingAnnouncement ? "Failed to update announcement" : "Failed to create announcement",
        description: message,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (announcement: any) => {
    try {
      if (isDemo) {
        setAnnouncements((prev) => prev.filter((item) => item.id !== announcement.id));
      } else {
        await invokeSupabaseFunction("manage-announcement-admin", {
          action: "delete",
          announcement_id: announcement.id,
        });
        setAnnouncements((prev) => prev.filter((item) => item.id !== announcement.id));
      }

      toast({
        title: "Announcement deleted",
        description: "The announcement has been removed.",
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      toast({
        title: "Failed to delete announcement",
        description: message,
        variant: "destructive",
      });
    } finally {
      setPendingDeleteAnnouncement(null);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground">Announcements</h2>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            <Plus size={16} />
            New Announcement
          </button>
        </div>

        {loading ? (
          <CardSkeleton count={3} />
        ) : announcements.length === 0 ? (
          <EmptyState
            title="No announcements"
            description="Create your first announcement to notify parents or teachers."
            icon={Megaphone}
          />
        ) : (
          <div className="space-y-3">
            {announcements.map((announcement) => (
              <div key={announcement.id} className="rounded-xl border border-border bg-card p-5">
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary capitalize">
                      {announcement.target_role}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(announcement.created_at)}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingAnnouncement(announcement);
                        setForm({
                          message: announcement.message,
                          target_role: announcement.target_role,
                        });
                        setFormError("");
                        setShowModal(true);
                      }}
                      className="text-xs text-primary hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => setPendingDeleteAnnouncement(announcement)}
                      className="text-xs text-destructive hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <p className="text-sm text-foreground">{announcement.message}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmActionDialog
        open={Boolean(pendingDeleteAnnouncement)}
        onOpenChange={(open) => {
          if (!open) setPendingDeleteAnnouncement(null);
        }}
        title="Delete announcement?"
        description="This announcement will be removed from the admin portal."
        confirmLabel="Delete Announcement"
        onConfirm={() =>
          pendingDeleteAnnouncement && handleDelete(pendingDeleteAnnouncement)
        }
      />

      {showModal && (
        <>
          <div className="fixed inset-0 z-40 bg-background/60" onClick={closeModal} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-lg rounded-xl border border-border bg-card p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground">
                  {editingAnnouncement ? "Edit Announcement" : "New Announcement"}
                </h3>
                <button onClick={closeModal}>
                  <X className="h-5 w-5 text-muted-foreground" />
                </button>
              </div>

              <form onSubmit={handleAdd} className="space-y-4">
                {formError && (
                  <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                    {formError}
                  </div>
                )}

                <select
                  value={form.target_role}
                  onChange={(e) => setForm({ ...form, target_role: e.target.value })}
                  className="w-full rounded-lg border border-border bg-muted px-4 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                >
                  <option value="all">Everyone</option>
                  <option value="parent">Parents Only</option>
                  <option value="teacher">Teachers Only</option>
                </select>

                <textarea
                  placeholder="Type your announcement..."
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  rows={4}
                  required
                  className="w-full rounded-lg border border-border bg-muted px-4 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                />

                <button
                  type="submit"
                  className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
                >
                  {editingAnnouncement ? "Save Announcement" : "Send Announcement"}
                </button>
              </form>
            </div>
          </div>
        </>
      )}
    </AdminLayout>
  );
}
