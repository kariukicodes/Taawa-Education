import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/layouts/AdminLayout";
import { Users, GraduationCap, UserCheck, CreditCard } from "lucide-react";
import { formatKES, formatDate } from "@/lib/format";
import { KpiSkeleton } from "@/components/ui/KpiSkeleton";
import { TableSkeleton } from "@/components/ui/TableSkeleton";
import { EmptyState } from "@/components/ui/EmptyState";

export default function AdminOverview() {
  const [stats, setStats] = useState({ students: 0, tutors: 0, leads: 0, paymentsThisMonth: 0 });
  const [recentLeads, setRecentLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      const [students, tutors, leads, payments] = await Promise.all([
        supabase.from("students").select("id", { count: "exact", head: true }),
        supabase.from("tutors").select("id", { count: "exact", head: true }),
        supabase.from("leads").select("id", { count: "exact", head: true }).eq("status", "New"),
        supabase.from("payments").select("amount_kes").eq("status", "Paid").gte("date", new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0]),
      ]);
      const totalPayments = payments.data?.reduce((sum, p) => sum + p.amount_kes, 0) ?? 0;
      setStats({ students: students.count ?? 0, tutors: tutors.count ?? 0, leads: leads.count ?? 0, paymentsThisMonth: totalPayments });
      const { data } = await supabase.from("leads").select("*").order("created_at", { ascending: false }).limit(5);
      setRecentLeads(data ?? []);
      setLoading(false);
    };
    fetchAll();
  }, []);

  const kpis = [
    { label: "Total Students", value: stats.students, icon: GraduationCap },
    { label: "Active Tutors", value: stats.tutors, icon: UserCheck },
    { label: "Open Leads", value: stats.leads, icon: Users },
    { label: "Payments This Month", value: formatKES(stats.paymentsThisMonth), icon: CreditCard },
  ];

  return (
    <AdminLayout>
      <div className="space-y-8">
        <h2 className="text-2xl font-bold text-foreground">Overview</h2>

        {loading ? <KpiSkeleton /> : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {kpis.map((kpi) => (
              <div key={kpi.label} className="card-hover-glow rounded-xl border border-border bg-card p-5">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">{kpi.label}</p>
                  <kpi.icon className="h-5 w-5 text-primary" />
                </div>
                <p className="mt-2 text-2xl font-bold text-foreground">{kpi.value}</p>
              </div>
            ))}
          </div>
        )}

        <div>
          <h3 className="mb-4 text-lg font-semibold text-foreground">Recent Leads</h3>
          {loading ? <TableSkeleton columns={4} rows={5} /> : recentLeads.length === 0 ? (
            <EmptyState title="No leads yet" description="Leads will appear here when visitors submit the contact form." icon={Users} />
          ) : (
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground hidden sm:table-cell">Email</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground hidden md:table-cell">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentLeads.map((lead) => (
                    <tr key={lead.id} className="border-b border-border last:border-0 hover:bg-muted/50">
                      <td className="px-4 py-3 text-foreground">{lead.parent_name}</td>
                      <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{lead.email}</td>
                      <td className="px-4 py-3"><StatusBadge status={lead.status} /></td>
                      <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{formatDate(lead.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    New: "bg-primary/20 text-primary",
    Contacted: "bg-blue-500/20 text-blue-400",
    "Consultation Booked": "bg-purple-500/20 text-purple-400",
    Enrolled: "bg-secondary/20 text-secondary",
    Inactive: "bg-muted text-muted-foreground",
  };
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${colors[status] ?? "bg-muted text-muted-foreground"}`}>
      {status}
    </span>
  );
}
