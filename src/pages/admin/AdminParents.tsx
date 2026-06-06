import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/layouts/AdminLayout";
import { Plus, Search, X, UserCircle } from "lucide-react";
import { TableSkeleton } from "@/components/ui/TableSkeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { ConfirmActionDialog } from "@/components/ui/ConfirmActionDialog";
import { useAuth } from "@/contexts/AuthContext";
import { DEMO_DATA } from "@/lib/demoData";
import { toast } from "@/hooks/use-toast";
import { invokeSupabaseFunction } from "@/lib/invokeSupabaseFunction";
import { includesSearchTerm, sortByKey } from "@/lib/adminFilters";
import { validateParentAccountInput } from "@/lib/adminFormValidation";
import { reportClientError } from "@/lib/reportClientError";

type ParentRecord = {
  id: string;
  full_name: string;
  phone: string | null;
  user_id: string | null;
  status: string;
  archived_at?: string | null;
  account_email?: string | null;
  last_sign_in_at?: string | null;
  has_login?: boolean;
  created_at?: string;
  students: Array<{ full_name: string; grade: string | null }>;
};

export default function AdminParents() {
  const { roleOverride, loading: authLoading, user } = useAuth();
  const [parents, setParents] = useState<ParentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingParent, setEditingParent] = useState<ParentRecord | null>(null);
  const [formError, setFormError] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name-asc");
  const [pendingDeleteParent, setPendingDeleteParent] = useState<ParentRecord | null>(null);

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    password: "",
  });

  const isDemo =
    import.meta.env.DEV &&
    import.meta.env.VITE_ENABLE_DEMO_MODE === "true" &&
    roleOverride === "admin";

  const resetForm = (parent?: ParentRecord | null) => {
    setEditingParent(parent ?? null);
    setForm({
      full_name: parent?.full_name ?? "",
      email: "",
      phone: parent?.phone ?? "",
      password: "",
    });
    setFormError("");
  };

  const closeModal = () => {
    setShowModal(false);
    resetForm();
  };

  const fetchParents = async (showLoader = true) => {
    if (showLoader) {
      setLoading(true);
    }

    if (isDemo) {
      setParents(DEMO_DATA.admin.parents.parents as ParentRecord[]);
      if (showLoader) setLoading(false);
      return;
    }

    try {
      const { parents } = await invokeSupabaseFunction<{ parents: ParentRecord[] }>(
        "list-parents-admin",
        undefined,
      );

      setParents(parents ?? []);
    } catch (err) {
      reportClientError("AdminParents.fetchParents", err);
      const message = err instanceof Error ? err.message : String(err);
      toast({
        title: "Failed to load parents",
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
    void fetchParents();
  }, [isDemo, authLoading, user?.id]);

  const filteredParents = sortByKey(
    parents.filter((parent) => {
      const matchesSearch = includesSearchTerm(
        [
          parent.full_name,
          parent.phone,
          parent.account_email,
          parent.status,
          ...(parent.students?.map((student) => `${student.full_name} ${student.grade ?? ""}`) ?? []),
        ],
        search,
      );
      const matchesStatus = statusFilter === "all" || parent.status === statusFilter;
      return matchesSearch && matchesStatus;
    }),
    (parent) => {
      switch (sortBy) {
        case "students-desc":
          return parent.students?.length ?? 0;
        case "recent-desc":
          return parent.created_at ?? "";
        case "status-asc":
          return parent.status;
        case "name-asc":
        default:
          return parent.full_name;
      }
    },
    sortBy === "students-desc" || sortBy === "recent-desc" ? "desc" : "asc",
  );

  const upsertParent = (parent: ParentRecord) => {
    setParents((prev) => {
      const existing = prev.some((item) => item.id === parent.id);
      if (!existing) return [parent, ...prev];
      return prev.map((item) => (item.id === parent.id ? parent : item));
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    const validationError = editingParent
      ? !form.full_name.trim()
        ? "Parent full name is required."
        : null
      : validateParentAccountInput({
          full_name: form.full_name,
          email: form.email,
          password: form.password,
        });

    if (validationError) {
      setFormError(validationError);
      return;
    }

    if (isDemo) {
      const demoParent: ParentRecord = {
        id: editingParent?.id ?? `demo_parent_${Date.now()}`,
        full_name: form.full_name,
        phone: form.phone || null,
        user_id: editingParent?.user_id ?? null,
        status: editingParent?.status ?? "active",
        archived_at: editingParent?.archived_at ?? null,
        students: editingParent?.students ?? [],
      };

      upsertParent(demoParent);
      closeModal();
      toast({
        title: editingParent ? "Parent updated" : "Parent added",
        description: editingParent
          ? "Demo parent updated locally."
          : "Demo parent created locally.",
      });
      return;
    }

    try {
      if (editingParent) {
        const { parent } = await invokeSupabaseFunction<{ parent: ParentRecord }>(
          "manage-parent-admin",
          {
            action: "update",
            parent_id: editingParent.id,
            full_name: form.full_name,
            phone: form.phone || null,
          },
        );

        upsertParent(parent);
        toast({
          title: "Parent updated",
          description: "Parent details saved successfully.",
        });
      } else {
        const { parent } = await invokeSupabaseFunction<{ parent: ParentRecord }>(
          "create-parent-user",
          {
            full_name: form.full_name,
            email: form.email,
            phone: form.phone || null,
            password: form.password,
          },
        );

        upsertParent({ ...parent, students: [] });
        toast({
          title: "Parent added",
          description: "Parent login account created successfully.",
        });
      }

      closeModal();
      void fetchParents(false);
    } catch (err) {
      reportClientError("AdminParents.handleSubmit", err, {
        parentId: editingParent?.id,
      });
      const message = err instanceof Error ? err.message : String(err);
      setFormError(message);
      toast({
        title: editingParent ? "Failed to update parent" : "Failed to add parent",
        description: message,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (parent: ParentRecord) => {
    setSavingId(parent.id);

    try {
      if (isDemo) {
        setParents((prev) => prev.filter((item) => item.id !== parent.id));
      } else {
        await invokeSupabaseFunction("manage-parent-admin", {
          action: "delete",
          parent_id: parent.id,
        });

        setParents((prev) => prev.filter((item) => item.id !== parent.id));
      }

      toast({
        title: "Parent deleted",
        description: `${parent.full_name} has been removed.`,
      });
    } catch (err) {
      reportClientError("AdminParents.handleDelete", err, {
        parentId: parent.id,
      });
      const message = err instanceof Error ? err.message : String(err);
      toast({
        title: "Failed to delete parent",
        description: message,
        variant: "destructive",
      });
    } finally {
      setSavingId(null);
      setPendingDeleteParent(null);
    }
  };

  const handleArchiveToggle = async (parent: ParentRecord) => {
    const action = parent.status === "active" ? "archive" : "restore";
    setSavingId(parent.id);

    try {
      if (isDemo) {
        upsertParent({
          ...parent,
          status: action === "archive" ? "inactive" : "active",
          archived_at: action === "archive" ? new Date().toISOString() : null,
        });
      } else {
        const { parent: updatedParent } = await invokeSupabaseFunction<{ parent: ParentRecord }>(
          "manage-parent-admin",
          {
            action,
            parent_id: parent.id,
          },
        );

        upsertParent(updatedParent);
      }

      toast({
        title: action === "archive" ? "Parent archived" : "Parent restored",
        description: `${parent.full_name} is now ${action === "archive" ? "inactive" : "active"}.`,
      });
    } catch (err) {
      reportClientError("AdminParents.handleArchiveToggle", err, {
        parentId: parent.id,
        action,
      });
      const message = err instanceof Error ? err.message : String(err);
      toast({
        title: `Failed to ${action} parent`,
        description: message,
        variant: "destructive",
      });
    } finally {
      setSavingId(null);
    }
  };

  const handleAccountAction = async (
    parent: ParentRecord,
    action: "send_reset" | "generate_invite_link",
  ) => {
    if (!parent.has_login) {
      toast({
        title: "No linked login",
        description: "This parent profile does not have a linked auth account.",
        variant: "destructive",
      });
      return;
    }

    setSavingId(parent.id);

    try {
      const result = await invokeSupabaseFunction<{
        message: string;
        email: string;
        action_link?: string;
      }>("manage-user-account-admin", {
        entity_id: parent.id,
        entity_type: "parent",
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
      reportClientError("AdminParents.handleAccountAction", err, {
        parentId: parent.id,
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
          <h2 className="text-2xl font-bold text-foreground">Parents</h2>

          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            <Plus size={16} />
            Add Parent
          </button>
        </div>

        <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by parent, student, email, or phone..."
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
            <option value="inactive">Archived</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="rounded-lg border border-border bg-muted px-4 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
          >
            <option value="name-asc">Sort by Name</option>
            <option value="students-desc">Sort by Students</option>
            <option value="status-asc">Sort by Status</option>
            <option value="recent-desc">Sort by Newest</option>
          </select>
        </div>

        {loading ? (
          <TableSkeleton columns={6} />
        ) : filteredParents.length === 0 ? (
          <EmptyState
            title={parents.length === 0 ? "No parents yet" : "No parents match these filters"}
            description={
              parents.length === 0
                ? "Add your first parent to get started."
                : "Try a different search term, status filter, or sort option."
            }
            icon={UserCircle}
          />
        ) : (
          <div className="overflow-x-auto rounded-xl border border-border bg-card">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  {["Name", "Phone", "Login", "Status", "Linked Students", "Actions"].map((heading) => (
                    <th
                      key={heading}
                      className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {filteredParents.map((parent) => (
                  <tr
                    key={parent.id}
                    className="border-b border-border last:border-0 hover:bg-muted/50"
                  >
                    <td className="px-4 py-3 text-foreground">{parent.full_name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{parent.phone || "-"}</td>
                    <td className="px-4 py-3">
                      <div className="space-y-1">
                        <p className="text-foreground">{parent.account_email || "Profile only"}</p>
                        <p className="text-xs text-muted-foreground">
                          {parent.has_login ? "Linked login" : "No login linked"}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          parent.status === "active"
                            ? "bg-secondary/20 text-secondary"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {parent.status === "active" ? "Active" : "Archived"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {parent.students?.length ? (
                        <div className="flex flex-wrap gap-1">
                          {parent.students.map((student) => (
                            <span
                              key={`${parent.id}-${student.full_name}`}
                              className="rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                            >
                              {student.full_name} ({student.grade || "No grade"})
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">No linked students</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          disabled={savingId === parent.id || !parent.has_login}
                          onClick={() => void handleAccountAction(parent, "generate_invite_link")}
                          className="rounded-lg border border-border px-3 py-2 text-xs font-medium text-foreground hover:bg-muted disabled:opacity-50"
                        >
                          Invite Link
                        </button>
                        <button
                          type="button"
                          disabled={savingId === parent.id || !parent.has_login}
                          onClick={() => void handleAccountAction(parent, "send_reset")}
                          className="rounded-lg border border-border px-3 py-2 text-xs font-medium text-foreground hover:bg-muted disabled:opacity-50"
                        >
                          Reset Password
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            resetForm(parent);
                            setShowModal(true);
                          }}
                          className="rounded-lg border border-border px-3 py-2 text-xs font-medium text-foreground hover:bg-muted"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          disabled={savingId === parent.id}
                          onClick={() => void handleArchiveToggle(parent)}
                          className="rounded-lg border border-border px-3 py-2 text-xs font-medium text-foreground hover:bg-muted disabled:opacity-50"
                        >
                          {parent.status === "active" ? "Archive" : "Restore"}
                        </button>
                        <button
                          type="button"
                          disabled={savingId === parent.id}
                          onClick={() => setPendingDeleteParent(parent)}
                          className="rounded-lg border border-destructive/30 px-3 py-2 text-xs font-medium text-destructive hover:bg-destructive/10 disabled:opacity-50"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <>
          <div className="fixed inset-0 z-40 bg-background/60" onClick={closeModal} />

          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md rounded-xl border border-border bg-card p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground">
                  {editingParent ? "Edit Parent" : "Add New Parent"}
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
                  {editingParent
                    ? "Update the parent profile details below."
                    : "This creates a parent login account and links the profile automatically."}
                </p>

                <input
                  placeholder="Parent Full Name"
                  value={form.full_name}
                  onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                  required
                  className="w-full rounded-lg border border-border bg-muted px-4 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                />

                {!editingParent && (
                  <>
                    <input
                      type="email"
                      placeholder="Parent Email"
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

                <button
                  type="submit"
                  className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
                >
                  {editingParent ? "Save Parent" : "Add Parent"}
                </button>
              </form>
            </div>
          </div>
        </>
      )}

      <ConfirmActionDialog
        open={Boolean(pendingDeleteParent)}
        onOpenChange={(open) => {
          if (!open) setPendingDeleteParent(null);
        }}
        title="Delete parent?"
        description={
          pendingDeleteParent
            ? `This removes ${pendingDeleteParent.full_name}'s parent profile. Reassign linked students first if any are attached.`
            : ""
        }
        confirmLabel="Delete Parent"
        onConfirm={() => pendingDeleteParent && handleDelete(pendingDeleteParent)}
      />
    </AdminLayout>
  );
}
