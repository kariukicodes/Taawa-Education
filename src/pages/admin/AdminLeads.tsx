import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/layouts/AdminLayout";
import { Search, X, Users } from "lucide-react";
import { formatDate } from "@/lib/format";
import { TableSkeleton } from "@/components/ui/TableSkeleton";
import { EmptyState } from "@/components/ui/EmptyState";

const statusColors: Record<string, string> = {
  New: "bg-primary/20 text-primary",
  Contacted: "bg-blue-500/20 text-blue-400",
  "Consultation Booked": "bg-purple-500/20 text-purple-400",
  Enrolled: "bg-secondary/20 text-secondary",
  Inactive: "bg-muted text-muted-foreground",
};

export default function AdminLeads() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [panelNotes, setPanelNotes] = useState("");
  const [panelStatus, setPanelStatus] = useState("");
  const [panelFollowUp, setPanelFollowUp] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchLeads = async () => {
    let query = supabase.from("leads").select("*").order("created_at", { ascending: false });
    if (statusFilter) query = query.eq("status", statusFilter);
    const { data } = await query;
    setLeads(data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchLeads(); }, [statusFilter]);

  const filtered = leads.filter((l) => {
    const term = search.toLowerCase();
    return !term || l.parent_name?.toLowerCase().includes(term) || l.email?.toLowerCase().includes(term);
  });

  const openPanel = (lead: any) => {
    setSelectedLead(lead);
    setPanelNotes(lead.notes ?? "");
    setPanelStatus(lead.status);
    setPanelFollowUp(lead.follow_up_date ?? "");
  };

  const saveChanges = async () => {
    if (!selectedLead) return;
    setSaving(true);
    await supabase.from("leads").update({ status: panelStatus, notes: panelNotes, follow_up_date: panelFollowUp || null }).eq("id", selectedLead.id);
    setSaving(false);
    setSelectedLead(null);
    fetchLeads();
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-foreground">Leads</h2>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or email..."
              className="w-full rounded-lg border border-border bg-muted py-2 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none" />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-border bg-muted px-4 py-2 text-sm text-foreground focus:border-primary focus:outline-none">
            <option value="">All Statuses</option>
            {["New", "Contacted", "Consultation Booked", "Enrolled", "Inactive"].map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {loading ? <TableSkeleton columns={8} rows={5} /> : filtered.length === 0 ? (
          <EmptyState title="No leads found" description="Try adjusting your search or filter criteria." icon={Users} />
        ) : (
          <div className="rounded-xl border border-border bg-card overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border">
                {["Parent Name", "Email", "Phone", "Child", "Grade", "Curriculum", "Status", "Date"].map((h) => (
                  <th key={h} className="whitespace-nowrap px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {filtered.map((lead) => (
                  <tr key={lead.id} onClick={() => openPanel(lead)} className="cursor-pointer border-b border-border last:border-0 hover:bg-muted/50">
                    <td className="px-4 py-3 text-foreground">{lead.parent_name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{lead.email}</td>
                    <td className="px-4 py-3 text-muted-foreground">{lead.phone}</td>
                    <td className="px-4 py-3 text-foreground">{lead.child_name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{lead.grade}</td>
                    <td className="px-4 py-3 text-muted-foreground">{lead.curriculum_interest}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[lead.status] ?? ""}`}>{lead.status}</span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{formatDate(lead.created_at)}</td>
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
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-foreground">Lead Details</h3>
              <button onClick={() => setSelectedLead(null)}><X className="h-5 w-5 text-muted-foreground" /></button>
            </div>
            <div className="space-y-4 text-sm">
              <div><p className="text-muted-foreground">Parent Name</p><p className="text-foreground">{selectedLead.parent_name}</p></div>
              <div><p className="text-muted-foreground">Email</p><p className="text-foreground">{selectedLead.email}</p></div>
              <div><p className="text-muted-foreground">Phone</p><p className="text-foreground">{selectedLead.phone}</p></div>
              <div><p className="text-muted-foreground">Child</p><p className="text-foreground">{selectedLead.child_name}, Age {selectedLead.child_age}</p></div>
              <div><p className="text-muted-foreground">Grade</p><p className="text-foreground">{selectedLead.grade}</p></div>
              <div><p className="text-muted-foreground">Curriculum Interest</p><p className="text-foreground">{selectedLead.curriculum_interest}</p></div>
              <div><p className="text-muted-foreground">Referral Source</p><p className="text-foreground">{selectedLead.referral_source || "—"}</p></div>
              <div><p className="text-muted-foreground">Message</p><p className="text-foreground">{selectedLead.message || "—"}</p></div>

              <div className="border-t border-border pt-4">
                <label className="mb-1.5 block text-sm font-medium text-foreground">Status</label>
                <select value={panelStatus} onChange={(e) => setPanelStatus(e.target.value)}
                  className="w-full rounded-lg border border-border bg-muted px-4 py-2 text-sm text-foreground focus:border-primary focus:outline-none">
                  {["New", "Contacted", "Consultation Booked", "Enrolled", "Inactive"].map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Internal Notes</label>
                <textarea rows={4} value={panelNotes} onChange={(e) => setPanelNotes(e.target.value)}
                  className="w-full rounded-lg border border-border bg-muted px-4 py-2 text-sm text-foreground focus:border-primary focus:outline-none" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Follow-up Date</label>
                <input type="date" value={panelFollowUp} onChange={(e) => setPanelFollowUp(e.target.value)}
                  className="w-full rounded-lg border border-border bg-muted px-4 py-2 text-sm text-foreground focus:border-primary focus:outline-none" />
              </div>
              <button onClick={saveChanges} disabled={saving}
                className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </>
      )}
    </AdminLayout>
  );
}
