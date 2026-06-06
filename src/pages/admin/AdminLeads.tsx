import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/layouts/AdminLayout";
import { Plus, Search, X, Users } from "lucide-react";
import { formatDate } from "@/lib/format";
import { TableSkeleton } from "@/components/ui/TableSkeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { ConfirmActionDialog } from "@/components/ui/ConfirmActionDialog";
import { useAuth } from "@/contexts/AuthContext";
import { DEMO_DATA } from "@/lib/demoData";
import { toast } from "@/hooks/use-toast";
import { invokeSupabaseFunction } from "@/lib/invokeSupabaseFunction";

type LeadRecord = {
  id: string;
  parent_name: string;
  email: string;
  phone: string | null;
  child_name: string | null;
  child_age: number | null;
  grade: string | null;
  curriculum_interest: string | null;
  referral_source: string | null;
  message: string | null;
  status: string;
  notes: string | null;
  follow_up_date: string | null;
  created_at: string;
};

type TutorOption = {
  id: string;
  full_name: string;
};

const statusColors: Record<string, string> = {
  New: "bg-primary/20 text-primary",
  Contacted: "bg-blue-500/20 text-blue-400",
  "Consultation Booked": "bg-sky-500/20 text-sky-400",
  Enrolled: "bg-secondary/20 text-secondary",
  Inactive: "bg-muted text-muted-foreground",
};

const initialLeadForm = {
  parent_name: "",
  email: "",
  phone: "",
  child_name: "",
  child_age: "",
  grade: "",
  curriculum_interest: "CBC",
  referral_source: "",
  message: "",
  status: "New",
};

export default function AdminLeads() {
  const { roleOverride, loading: authLoading, user } = useAuth();
  const [leads, setLeads] = useState<LeadRecord[]>([]);
  const [tutors, setTutors] = useState<TutorOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedLead, setSelectedLead] = useState<LeadRecord | null>(null);
  const [panelNotes, setPanelNotes] = useState("");
  const [panelStatus, setPanelStatus] = useState("");
  const [panelFollowUp, setPanelFollowUp] = useState("");
  const [saving, setSaving] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [formError, setFormError] = useState("");
  const [leadForm, setLeadForm] = useState(initialLeadForm);
  const [convertCreateStudent, setConvertCreateStudent] = useState(true);
  const [convertTutorId, setConvertTutorId] = useState("");
  const [showDeleteLeadDialog, setShowDeleteLeadDialog] = useState(false);

  const isDemo =
    import.meta.env.DEV &&
    import.meta.env.VITE_ENABLE_DEMO_MODE === "true" &&
    roleOverride === "admin";

  const fetchData = async (showLoader = true) => {
    if (showLoader) {
      setLoading(true);
    }

    if (isDemo) {
      setLeads(DEMO_DATA.admin.leads.leads as LeadRecord[]);
      setTutors(
        (DEMO_DATA.admin.students.tutors as any[]).map((tutor) => ({
          id: tutor.id,
          full_name: tutor.full_name,
        })),
      );
      if (showLoader) setLoading(false);
      return;
    }

    try {
      const [{ leads }, { tutors }] = await Promise.all([
        invokeSupabaseFunction<{ leads: LeadRecord[] }>("list-leads-admin", undefined),
        invokeSupabaseFunction<{ tutors: TutorOption[] }>("list-tutors-admin", undefined),
      ]);

      setLeads(leads ?? []);
      setTutors((tutors ?? []).map((tutor) => ({ id: tutor.id, full_name: tutor.full_name })));
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      toast({
        title: "Failed to load leads",
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
    void fetchData();
  }, [isDemo, authLoading, user?.id]);

  const filtered = leads.filter((lead) => {
    const term = search.toLowerCase();
    const matchesSearch =
      !term ||
      lead.parent_name?.toLowerCase().includes(term) ||
      lead.email?.toLowerCase().includes(term) ||
      lead.child_name?.toLowerCase().includes(term);
    const matchesStatus = !statusFilter || lead.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const openPanel = (lead: LeadRecord) => {
    setSelectedLead(lead);
    setPanelNotes(lead.notes ?? "");
    setPanelStatus(lead.status);
    setPanelFollowUp(lead.follow_up_date ?? "");
  };

  const updateLeadInState = (lead: LeadRecord) => {
    setLeads((prev) => prev.map((item) => (item.id === lead.id ? lead : item)));
    if (selectedLead?.id === lead.id) {
      setSelectedLead(lead);
    }
  };

  const saveChanges = async () => {
    if (!selectedLead) return;
    setSaving(true);

    try {
      if (isDemo) {
        const nextLead = {
          ...selectedLead,
          status: panelStatus,
          notes: panelNotes,
          follow_up_date: panelFollowUp || null,
        };
        updateLeadInState(nextLead);
      } else {
        const { lead } = await invokeSupabaseFunction<{ lead: LeadRecord }>(
          "manage-lead-admin",
          {
            action: "update",
            lead_id: selectedLead.id,
            parent_name: selectedLead.parent_name,
            email: selectedLead.email,
            phone: selectedLead.phone,
            child_name: selectedLead.child_name,
            child_age: selectedLead.child_age,
            grade: selectedLead.grade,
            curriculum_interest: selectedLead.curriculum_interest,
            referral_source: selectedLead.referral_source,
            message: selectedLead.message,
            status: panelStatus,
            notes: panelNotes,
            follow_up_date: panelFollowUp || null,
          },
        );

        updateLeadInState(lead);
      }

      toast({
        title: "Lead updated",
        description: "Lead details saved successfully.",
      });
      setSelectedLead(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      toast({
        title: "Failed to update lead",
        description: message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!leadForm.parent_name.trim()) {
      setFormError("Parent name is required.");
      return;
    }

    if (!leadForm.email.trim()) {
      setFormError("Email is required.");
      return;
    }

    try {
      if (isDemo) {
        setLeads((prev) => [
          {
            id: `demo_lead_${Date.now()}`,
            parent_name: leadForm.parent_name,
            email: leadForm.email,
            phone: leadForm.phone || null,
            child_name: leadForm.child_name || null,
            child_age: leadForm.child_age ? parseInt(leadForm.child_age, 10) : null,
            grade: leadForm.grade || null,
            curriculum_interest: leadForm.curriculum_interest || null,
            referral_source: leadForm.referral_source || null,
            message: leadForm.message || null,
            status: leadForm.status,
            notes: null,
            follow_up_date: null,
            created_at: new Date().toISOString(),
          },
          ...prev,
        ]);
      } else {
        const { lead } = await invokeSupabaseFunction<{ lead: LeadRecord }>("manage-lead-admin", {
          action: "create",
          parent_name: leadForm.parent_name,
          email: leadForm.email,
          phone: leadForm.phone || null,
          child_name: leadForm.child_name || null,
          child_age: leadForm.child_age ? parseInt(leadForm.child_age, 10) : null,
          grade: leadForm.grade || null,
          curriculum_interest: leadForm.curriculum_interest || null,
          referral_source: leadForm.referral_source || null,
          message: leadForm.message || null,
          status: leadForm.status,
        });

        setLeads((prev) => [lead, ...prev]);
      }

      setLeadForm(initialLeadForm);
      setShowCreateModal(false);
      toast({
        title: "Lead created",
        description: "The new lead has been added.",
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setFormError(message);
      toast({
        title: "Failed to create lead",
        description: message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteLead = async () => {
    if (!selectedLead) return;

    try {
      if (isDemo) {
        setLeads((prev) => prev.filter((lead) => lead.id !== selectedLead.id));
      } else {
        await invokeSupabaseFunction("manage-lead-admin", {
          action: "delete",
          lead_id: selectedLead.id,
        });

        setLeads((prev) => prev.filter((lead) => lead.id !== selectedLead.id));
      }

      toast({
        title: "Lead deleted",
        description: "The lead has been removed.",
      });
      setSelectedLead(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      toast({
        title: "Failed to delete lead",
        description: message,
        variant: "destructive",
      });
    } finally {
      setShowDeleteLeadDialog(false);
    }
  };

  const handleConvertLead = async () => {
    if (!selectedLead) return;

    try {
      if (!isDemo) {
        const { lead } = await invokeSupabaseFunction<{ lead: LeadRecord }>("manage-lead-admin", {
          action: "convert",
          lead_id: selectedLead.id,
          create_student: convertCreateStudent,
          tutor_id: convertTutorId || null,
        });

        updateLeadInState(lead);
      } else {
        updateLeadInState({ ...selectedLead, status: "Enrolled" });
      }

      toast({
        title: "Lead converted",
        description: convertCreateStudent
          ? "Parent and student records were created from this lead."
          : "A parent profile was created from this lead.",
      });

      setShowConvertModal(false);
      setSelectedLead(null);
      setConvertCreateStudent(true);
      setConvertTutorId("");
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      toast({
        title: "Failed to convert lead",
        description: message,
        variant: "destructive",
      });
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground">Leads</h2>

          <button
            onClick={() => {
              setLeadForm(initialLeadForm);
              setFormError("");
              setShowCreateModal(true);
            }}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            <Plus size={16} />
            Add Lead
          </button>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by parent, child, or email..."
              className="w-full rounded-lg border border-border bg-muted py-2 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-border bg-muted px-4 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
          >
            <option value="">All Statuses</option>
            {["New", "Contacted", "Consultation Booked", "Enrolled", "Inactive"].map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <TableSkeleton columns={8} rows={5} />
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No leads found"
            description="Try adjusting your search or add a new lead."
            icon={Users}
          />
        ) : (
          <div className="overflow-x-auto rounded-xl border border-border bg-card">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  {["Parent Name", "Email", "Phone", "Child", "Grade", "Curriculum", "Status", "Date"].map(
                    (heading) => (
                      <th
                        key={heading}
                        className="whitespace-nowrap px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground"
                      >
                        {heading}
                      </th>
                    ),
                  )}
                </tr>
              </thead>

              <tbody>
                {filtered.map((lead) => (
                  <tr
                    key={lead.id}
                    onClick={() => openPanel(lead)}
                    className="cursor-pointer border-b border-border last:border-0 hover:bg-muted/50"
                  >
                    <td className="px-4 py-3 text-foreground">{lead.parent_name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{lead.email}</td>
                    <td className="px-4 py-3 text-muted-foreground">{lead.phone}</td>
                    <td className="px-4 py-3 text-foreground">{lead.child_name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{lead.grade}</td>
                    <td className="px-4 py-3 text-muted-foreground">{lead.curriculum_interest}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          statusColors[lead.status] ?? ""
                        }`}
                      >
                        {lead.status}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                      {formatDate(lead.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedLead && (
        <>
          <div className="fixed inset-0 z-40 bg-background/60" onClick={() => setSelectedLead(null)} />
          <div className="fixed right-0 top-0 z-50 h-full w-full max-w-md overflow-y-auto border-l border-border bg-card p-6">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">Lead Details</h3>
              <button onClick={() => setSelectedLead(null)}>
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>

            <div className="space-y-4 text-sm">
              <div><p className="text-muted-foreground">Parent Name</p><p className="text-foreground">{selectedLead.parent_name}</p></div>
              <div><p className="text-muted-foreground">Email</p><p className="text-foreground">{selectedLead.email}</p></div>
              <div><p className="text-muted-foreground">Phone</p><p className="text-foreground">{selectedLead.phone || "-"}</p></div>
              <div><p className="text-muted-foreground">Child</p><p className="text-foreground">{selectedLead.child_name || "-"}, Age {selectedLead.child_age ?? "-"}</p></div>
              <div><p className="text-muted-foreground">Grade</p><p className="text-foreground">{selectedLead.grade || "-"}</p></div>
              <div><p className="text-muted-foreground">Curriculum Interest</p><p className="text-foreground">{selectedLead.curriculum_interest || "-"}</p></div>
              <div><p className="text-muted-foreground">Referral Source</p><p className="text-foreground">{selectedLead.referral_source || "-"}</p></div>
              <div><p className="text-muted-foreground">Message</p><p className="text-foreground">{selectedLead.message || "-"}</p></div>

              <div className="border-t border-border pt-4">
                <label className="mb-1.5 block text-sm font-medium text-foreground">Status</label>
                <select
                  value={panelStatus}
                  onChange={(e) => setPanelStatus(e.target.value)}
                  className="w-full rounded-lg border border-border bg-muted px-4 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                >
                  {["New", "Contacted", "Consultation Booked", "Enrolled", "Inactive"].map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Internal Notes</label>
                <textarea
                  rows={4}
                  value={panelNotes}
                  onChange={(e) => setPanelNotes(e.target.value)}
                  className="w-full rounded-lg border border-border bg-muted px-4 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Follow-up Date</label>
                <input
                  type="date"
                  value={panelFollowUp}
                  onChange={(e) => setPanelFollowUp(e.target.value)}
                  className="w-full rounded-lg border border-border bg-muted px-4 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => void saveChanges()}
                  disabled={saving}
                  className="rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
                <button
                  onClick={() => {
                    setShowConvertModal(true);
                    setConvertCreateStudent(true);
                    setConvertTutorId("");
                  }}
                  className="rounded-lg border border-border py-2.5 text-sm font-semibold text-foreground hover:bg-muted"
                >
                  Convert
                </button>
              </div>

              <button
                onClick={() => setShowDeleteLeadDialog(true)}
                className="w-full rounded-lg border border-destructive/30 py-2.5 text-sm font-semibold text-destructive hover:bg-destructive/10"
              >
                Delete Lead
              </button>
            </div>
          </div>
        </>
      )}

      <ConfirmActionDialog
        open={showDeleteLeadDialog}
        onOpenChange={setShowDeleteLeadDialog}
        title="Delete lead?"
        description={
          selectedLead
            ? `This removes the lead record for ${selectedLead.parent_name}.`
            : ""
        }
        confirmLabel="Delete Lead"
        onConfirm={() => void handleDeleteLead()}
      />

      {showCreateModal && (
        <>
          <div className="fixed inset-0 z-40 bg-background/60" onClick={() => setShowCreateModal(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-lg rounded-xl border border-border bg-card p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground">Add New Lead</h3>
                <button onClick={() => setShowCreateModal(false)}>
                  <X className="h-5 w-5 text-muted-foreground" />
                </button>
              </div>

              <form onSubmit={handleCreateLead} className="space-y-4">
                {formError && (
                  <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                    {formError}
                  </div>
                )}

                <input
                  placeholder="Parent Name"
                  value={leadForm.parent_name}
                  onChange={(e) => setLeadForm({ ...leadForm, parent_name: e.target.value })}
                  className="w-full rounded-lg border border-border bg-muted px-4 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={leadForm.email}
                  onChange={(e) => setLeadForm({ ...leadForm, email: e.target.value })}
                  className="w-full rounded-lg border border-border bg-muted px-4 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                />
                <input
                  placeholder="Phone"
                  value={leadForm.phone}
                  onChange={(e) => setLeadForm({ ...leadForm, phone: e.target.value })}
                  className="w-full rounded-lg border border-border bg-muted px-4 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                />
                <input
                  placeholder="Child Name"
                  value={leadForm.child_name}
                  onChange={(e) => setLeadForm({ ...leadForm, child_name: e.target.value })}
                  className="w-full rounded-lg border border-border bg-muted px-4 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                />
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="number"
                    placeholder="Child Age"
                    value={leadForm.child_age}
                    onChange={(e) => setLeadForm({ ...leadForm, child_age: e.target.value })}
                    className="rounded-lg border border-border bg-muted px-4 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                  />
                  <input
                    placeholder="Grade"
                    value={leadForm.grade}
                    onChange={(e) => setLeadForm({ ...leadForm, grade: e.target.value })}
                    className="rounded-lg border border-border bg-muted px-4 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                  />
                </div>
                <select
                  value={leadForm.curriculum_interest}
                  onChange={(e) => setLeadForm({ ...leadForm, curriculum_interest: e.target.value })}
                  className="w-full rounded-lg border border-border bg-muted px-4 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                >
                  {["CBC", "British", "Montessori", "Custom"].map((curriculum) => (
                    <option key={curriculum} value={curriculum}>
                      {curriculum}
                    </option>
                  ))}
                </select>
                <input
                  placeholder="Referral Source"
                  value={leadForm.referral_source}
                  onChange={(e) => setLeadForm({ ...leadForm, referral_source: e.target.value })}
                  className="w-full rounded-lg border border-border bg-muted px-4 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                />
                <textarea
                  rows={4}
                  placeholder="Lead message or notes"
                  value={leadForm.message}
                  onChange={(e) => setLeadForm({ ...leadForm, message: e.target.value })}
                  className="w-full rounded-lg border border-border bg-muted px-4 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                />

                <button
                  type="submit"
                  className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
                >
                  Create Lead
                </button>
              </form>
            </div>
          </div>
        </>
      )}

      {showConvertModal && selectedLead && (
        <>
          <div className="fixed inset-0 z-50 bg-background/60" onClick={() => setShowConvertModal(false)} />
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="w-full max-w-md rounded-xl border border-border bg-card p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground">Convert Lead</h3>
                <button onClick={() => setShowConvertModal(false)}>
                  <X className="h-5 w-5 text-muted-foreground" />
                </button>
              </div>

              <div className="space-y-4 text-sm">
                <p className="text-muted-foreground">
                  This will create a parent profile from {selectedLead.parent_name}.
                </p>

                <label className="flex items-center gap-2 text-foreground">
                  <input
                    type="checkbox"
                    checked={convertCreateStudent}
                    onChange={(e) => setConvertCreateStudent(e.target.checked)}
                  />
                  Also create a student record from this lead
                </label>

                {convertCreateStudent && (
                  <select
                    value={convertTutorId}
                    onChange={(e) => setConvertTutorId(e.target.value)}
                    className="w-full rounded-lg border border-border bg-muted px-4 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                  >
                    <option value="">Assign Tutor Later</option>
                    {tutors.map((tutor) => (
                      <option key={tutor.id} value={tutor.id}>
                        {tutor.full_name}
                      </option>
                    ))}
                  </select>
                )}

                <button
                  onClick={() => void handleConvertLead()}
                  className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
                >
                  Confirm Conversion
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </AdminLayout>
  );
}
