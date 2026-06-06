import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/layouts/AdminLayout";
import { Plus, Search, X, UserCheck } from "lucide-react";
import { formatKES } from "@/lib/format";
import { CardSkeleton } from "@/components/ui/CardSkeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { ConfirmActionDialog } from "@/components/ui/ConfirmActionDialog";
import { useAuth } from "@/contexts/AuthContext";
import { DEMO_DATA } from "@/lib/demoData";
import { toast } from "@/hooks/use-toast";
import { invokeSupabaseFunction } from "@/lib/invokeSupabaseFunction";
import { includesSearchTerm, sortByKey } from "@/lib/adminFilters";
import { validateTutorAccountInput } from "@/lib/adminFormValidation";
import { reportClientError } from "@/lib/reportClientError";

type TutorRecord = {
  id: string;
  full_name: string;
  phone: string | null;
  rate_kes: number | null;
  status: string;
  user_id: string | null;
  account_email?: string | null;
  last_sign_in_at?: string | null;
  has_login?: boolean;
  created_at?: string;
  tutor_assignments: Array<Record<string, never>>;
};

export default function AdminTutors() {
  const { roleOverride, loading: authLoading, user } = useAuth();
  const [tutors, setTutors] = useState<TutorRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTutor, setEditingTutor] = useState<TutorRecord | null>(null);
  const [formError, setFormError] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name-asc");
  const [pendingDeleteTutor, setPendingDeleteTutor] = useState<TutorRecord | null>(null);

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    password: "",
    rate_kes: "",
    status: "active",
  });

  const isDemo =
    import.meta.env.DEV &&
    import.meta.env.VITE_ENABLE_DEMO_MODE === "true" &&
    roleOverride === "admin";

  const resetForm = (tutor?: TutorRecord | null) => {
    setEditingTutor(tutor ?? null);
    setForm({
      full_name: tutor?.full_name ?? "",
      email: "",
      phone: tutor?.phone ?? "",
      password: "",
      rate_kes: tutor?.rate_kes?.toString() ?? "",
      status: tutor?.status ?? "active",
    });
    setFormError("");
  };

  const closeModal = () => {
    setShowModal(false);
    resetForm();
  };

  const fetchTutors = async (showLoader = true) => {
    if (showLoader) {
      setLoading(true);
    }

    if (isDemo) {
      setTutors(DEMO_DATA.admin.tutors.tutors as TutorRecord[]);
      if (showLoader) setLoading(false);
      return;
    }

    try {
      const { tutors } = await invokeSupabaseFunction<{ tutors: TutorRecord[] }>(
        "list-tutors-admin",
        undefined,
      );

      setTutors(tutors ?? []);
    } catch (err) {
      reportClientError("AdminTutors.fetchTutors", err);
      const message = err instanceof Error ? err.message : String(err);
      toast({
        title: "Failed to load tutors",
        description: message,
        variant: "destructive",
      });
    } finally {
      if (showLoader) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    if (authLoading) return;
    if (!isDemo && !user) return;
    void fetchTutors();
  }, [isDemo, authLoading, user?.id]);

  const filteredTutors = sortByKey(
    tutors.filter((tutor) => {
      const matchesSearch = includesSearchTerm(
        [
          tutor.full_name,
          tutor.phone,
          tutor.account_email,
          tutor.status,
          tutor.rate_kes,
        ],
        search,
      );
      const matchesStatus = statusFilter === "all" || tutor.status === statusFilter;
      return matchesSearch && matchesStatus;
    }),
    (tutor) => {
      switch (sortBy) {
        case "students-desc":
          return tutor.tutor_assignments?.length ?? 0;
        case "rate-desc":
          return tutor.rate_kes ?? 0;
        case "recent-desc":
          return tutor.created_at ?? "";
        case "name-asc":
        default:
          return tutor.full_name;
      }
    },
    sortBy === "students-desc" || sortBy === "rate-desc" || sortBy === "recent-desc"
      ? "desc"
      : "asc",
  );

  const upsertTutor = (tutor: TutorRecord) => {
    setTutors((prev) => {
      const existingIndex = prev.findIndex((item) => item.id === tutor.id);

      if (existingIndex === -1) {
        return [tutor, ...prev];
      }

      return prev.map((item) => (item.id === tutor.id ? tutor : item));
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    const validationError = editingTutor
      ? !form.full_name.trim()
        ? "Tutor full name is required."
        : null
      : validateTutorAccountInput({
          full_name: form.full_name,
          email: form.email,
          password: form.password,
        });

    if (validationError) {
      setFormError(validationError);
      return;
    }

    if (isDemo) {
      const demoTutor: TutorRecord = {
        id: editingTutor?.id ?? `demo_tutor_${Date.now()}`,
        full_name: form.full_name,
        phone: form.phone || null,
        rate_kes: parseInt(form.rate_kes) || 0,
        status: form.status,
        user_id: editingTutor?.user_id ?? null,
        tutor_assignments: editingTutor?.tutor_assignments ?? [],
      };

      upsertTutor(demoTutor);
      closeModal();
      toast({
        title: editingTutor ? "Tutor updated" : "Tutor added",
        description: editingTutor
          ? "Demo tutor updated locally."
          : "Demo tutor created locally.",
      });
      return;
    }

    try {
      if (editingTutor) {
        const { tutor } = await invokeSupabaseFunction<{ tutor: TutorRecord }>(
          "manage-tutor-admin",
          {
            action: "update",
            tutor_id: editingTutor.id,
            full_name: form.full_name,
            phone: form.phone || null,
            rate_kes: parseInt(form.rate_kes) || 0,
            status: form.status,
          },
        );

        upsertTutor(tutor);

        toast({
          title: "Tutor updated",
          description: "Tutor details saved successfully.",
        });
      } else {
        const { tutor } = await invokeSupabaseFunction<{ tutor: TutorRecord }>(
          "create-tutor-user",
          {
            full_name: form.full_name,
            email: form.email,
            phone: form.phone || null,
            password: form.password,
            rate_kes: parseInt(form.rate_kes) || 0,
            status: form.status,
          },
        );

        upsertTutor(tutor);

        toast({
          title: "Tutor added",
          description: "Tutor login account created successfully.",
        });
      }

      closeModal();
      void fetchTutors(false);
    } catch (err) {
      reportClientError("AdminTutors.handleSubmit", err, {
        tutorId: editingTutor?.id,
      });
      const message = err instanceof Error ? err.message : String(err);
      setFormError(message);
      toast({
        title: editingTutor ? "Failed to update tutor" : "Failed to add tutor",
        description: message,
        variant: "destructive",
      });
    }
  };

  const handleStatusToggle = async (tutor: TutorRecord) => {
    const nextStatus = tutor.status === "active" ? "inactive" : "active";
    setSavingId(tutor.id);

    try {
      if (isDemo) {
        upsertTutor({ ...tutor, status: nextStatus });
      } else {
        const { tutor: updatedTutor } = await invokeSupabaseFunction<{ tutor: TutorRecord }>(
          "manage-tutor-admin",
          {
            action: "update",
            tutor_id: tutor.id,
            full_name: tutor.full_name,
            phone: tutor.phone,
            rate_kes: tutor.rate_kes ?? 0,
            status: nextStatus,
          },
        );

        upsertTutor(updatedTutor);
      }

      toast({
        title: nextStatus === "active" ? "Tutor activated" : "Tutor deactivated",
        description: `${tutor.full_name} is now ${nextStatus}.`,
      });
    } catch (err) {
      reportClientError("AdminTutors.handleStatusToggle", err, {
        tutorId: tutor.id,
      });
      const message = err instanceof Error ? err.message : String(err);
      toast({
        title: "Failed to update tutor status",
        description: message,
        variant: "destructive",
      });
    } finally {
      setSavingId(null);
    }
  };

  const handleDelete = async (tutor: TutorRecord) => {
    setSavingId(tutor.id);

    try {
      if (isDemo) {
        setTutors((prev) => prev.filter((item) => item.id !== tutor.id));
      } else {
        await invokeSupabaseFunction("manage-tutor-admin", {
          action: "delete",
          tutor_id: tutor.id,
        });

        setTutors((prev) => prev.filter((item) => item.id !== tutor.id));
      }

      toast({
        title: "Tutor deleted",
        description: `${tutor.full_name} has been removed.`,
      });
    } catch (err) {
      reportClientError("AdminTutors.handleDelete", err, {
        tutorId: tutor.id,
      });
      const message = err instanceof Error ? err.message : String(err);
      toast({
        title: "Failed to delete tutor",
        description: message,
        variant: "destructive",
      });
    } finally {
      setSavingId(null);
      setPendingDeleteTutor(null);
    }
  };

  const handleAccountAction = async (
    tutor: TutorRecord,
    action: "send_reset" | "generate_invite_link",
  ) => {
    if (!tutor.has_login) {
      toast({
        title: "No linked login",
        description: "This tutor profile does not have a linked auth account.",
        variant: "destructive",
      });
      return;
    }

    setSavingId(tutor.id);

    try {
      const result = await invokeSupabaseFunction<{
        message: string;
        email: string;
        action_link?: string;
      }>("manage-user-account-admin", {
        entity_id: tutor.id,
        entity_type: "tutor",
        action,
        redirect_to: `${window.location.origin}/login`,
      });

      if (action === "generate_invite_link" && result.action_link) {
        await navigator.clipboard.writeText(result.action_link);
      }

      toast({
        title: action === "send_reset" ? "Reset sent" : "Invite link copied",
        description:
          action === "send_reset"
            ? result.message
            : `A sign-in link for ${result.email} was copied to your clipboard.`,
      });
    } catch (err) {
      reportClientError("AdminTutors.handleAccountAction", err, {
        tutorId: tutor.id,
        action,
      });
      const message = err instanceof Error ? err.message : String(err);
      toast({
        title: "Account action failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setSavingId(null);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground">Tutors</h2>

          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            <Plus size={16} />
            Add Tutor
          </button>
        </div>

        <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, phone, or rate..."
              className="w-full rounded-lg border border-border bg-muted py-2 pl-10 pr-4 text-sm text-foreground focus:border-primary focus:outline-none"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-border bg-muted px-4 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="rounded-lg border border-border bg-muted px-4 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
          >
            <option value="name-asc">Sort by Name</option>
            <option value="students-desc">Sort by Students</option>
            <option value="rate-desc">Sort by Rate</option>
            <option value="recent-desc">Sort by Newest</option>
          </select>
        </div>

        {loading ? (
          <CardSkeleton count={6} />
        ) : filteredTutors.length === 0 ? (
          <EmptyState
            title={tutors.length === 0 ? "No tutors yet" : "No tutors match these filters"}
            description={
              tutors.length === 0
                ? "Add your first tutor to get started."
                : "Try a different search term, status filter, or sort option."
            }
            icon={UserCheck}
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredTutors.map((tutor) => (
              <div
                key={tutor.id}
                className="card-hover-glow rounded-xl border border-border bg-card p-5"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 text-sm font-bold text-primary">
                    {tutor.full_name
                      ?.split(" ")
                      .map((name) => name[0])
                      .join("")}
                  </div>

                  <div>
                    <p className="font-semibold text-foreground">{tutor.full_name}</p>
                    <span
                      className={`text-xs font-medium ${
                        tutor.status === "active" ? "text-secondary" : "text-muted-foreground"
                      }`}
                    >
                      {tutor.status === "active" ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>

                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Students</span>
                    <span className="text-foreground">
                      {tutor.tutor_assignments?.length ?? 0}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Rate</span>
                    <span className="text-foreground">{formatKES(tutor.rate_kes)}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Phone</span>
                    <span className="text-foreground">{tutor.phone || "-"}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Login</span>
                    <span className="text-foreground">
                      {tutor.has_login ? tutor.account_email ?? "Linked" : "Profile only"}
                    </span>
                  </div>
                </div>

                <div className="mt-4 grid gap-2">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={savingId === tutor.id || !tutor.has_login}
                      onClick={() => void handleAccountAction(tutor, "generate_invite_link")}
                      className="flex-1 rounded-lg border border-border px-3 py-2 text-xs font-medium text-foreground hover:bg-muted disabled:opacity-50"
                    >
                      Invite Link
                    </button>
                    <button
                      type="button"
                      disabled={savingId === tutor.id || !tutor.has_login}
                      onClick={() => void handleAccountAction(tutor, "send_reset")}
                      className="flex-1 rounded-lg border border-border px-3 py-2 text-xs font-medium text-foreground hover:bg-muted disabled:opacity-50"
                    >
                      Reset Password
                    </button>
                  </div>

                  <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      resetForm(tutor);
                      setShowModal(true);
                    }}
                    className="flex-1 rounded-lg border border-border px-3 py-2 text-xs font-medium text-foreground hover:bg-muted"
                    >
                      Edit
                    </button>

                  <button
                    type="button"
                    disabled={savingId === tutor.id}
                    onClick={() => void handleStatusToggle(tutor)}
                    className="flex-1 rounded-lg border border-border px-3 py-2 text-xs font-medium text-foreground hover:bg-muted disabled:opacity-50"
                  >
                    {tutor.status === "active" ? "Deactivate" : "Activate"}
                  </button>

                        <button
                          type="button"
                          disabled={savingId === tutor.id}
                          onClick={() => setPendingDeleteTutor(tutor)}
                          className="rounded-lg border border-destructive/30 px-3 py-2 text-xs font-medium text-destructive hover:bg-destructive/10 disabled:opacity-50"
                        >
                          Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <>
          <div className="fixed inset-0 z-40 bg-background/60" onClick={closeModal} />

          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-lg rounded-xl border border-border bg-card p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground">
                  {editingTutor ? "Edit Tutor" : "Add New Tutor"}
                </h3>

                <button onClick={closeModal}>
                  <X className="h-5 w-5 text-muted-foreground" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {formError && (
                  <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                    {formError}
                  </div>
                )}

                <p className="text-sm text-muted-foreground">
                  {editingTutor
                    ? "Update the tutor profile details below."
                    : "This creates a tutor login account with the teacher role."}
                </p>

                <input
                  placeholder="Full Name"
                  value={form.full_name}
                  onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                  required
                  className="w-full rounded-lg border border-border bg-muted px-4 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                />

                {!editingTutor && (
                  <>
                    <input
                      type="email"
                      placeholder="Tutor Email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      required
                      className="w-full rounded-lg border border-border bg-muted px-4 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                    />

                    <input
                      type="password"
                      placeholder="Temporary Password"
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      minLength={8}
                      required
                      className="w-full rounded-lg border border-border bg-muted px-4 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                    />
                  </>
                )}

                <input
                  placeholder="Phone"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full rounded-lg border border-border bg-muted px-4 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                />

                <input
                  type="number"
                  placeholder="Rate (KES)"
                  value={form.rate_kes}
                  onChange={(e) => setForm({ ...form, rate_kes: e.target.value })}
                  className="w-full rounded-lg border border-border bg-muted px-4 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                />

                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full rounded-lg border border-border bg-muted px-4 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>

                <button
                  type="submit"
                  className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
                >
                  {editingTutor ? "Save Tutor" : "Add Tutor"}
                </button>
              </form>
            </div>
          </div>
        </>
      )}

      <ConfirmActionDialog
        open={Boolean(pendingDeleteTutor)}
        onOpenChange={(open) => {
          if (!open) setPendingDeleteTutor(null);
        }}
        title="Delete tutor?"
        description={
          pendingDeleteTutor
            ? `This removes ${pendingDeleteTutor.full_name}'s tutor profile and linked login account.`
            : ""
        }
        confirmLabel="Delete Tutor"
        onConfirm={() => pendingDeleteTutor && handleDelete(pendingDeleteTutor)}
      />
    </AdminLayout>
  );
}
