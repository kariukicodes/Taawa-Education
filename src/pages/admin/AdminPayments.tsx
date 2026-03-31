import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/layouts/AdminLayout";

export default function AdminPayments() {
  const [tab, setTab] = useState<"payments" | "earnings">("payments");
  const [payments, setPayments] = useState<any[]>([]);
  const [earnings, setEarnings] = useState<any[]>([]);

  useEffect(() => {
    const fetch = async () => {
      const [p, e] = await Promise.all([
        supabase.from("payments").select("*, students(full_name)").order("date", { ascending: false }),
        supabase.from("earnings").select("*, tutors(full_name)").order("date", { ascending: false }),
      ]);
      setPayments(p.data ?? []);
      setEarnings(e.data ?? []);
    };
    fetch();
  }, []);

  const statusColors: Record<string, string> = {
    Paid: "bg-secondary/20 text-secondary",
    Pending: "bg-primary/20 text-primary",
    Overdue: "bg-destructive/20 text-destructive",
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-foreground">Payments</h2>

        <div className="flex gap-2">
          {(["payments", "earnings"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${tab === t ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"}`}>
              {t === "payments" ? "Student Payments" : "Tutor Earnings"}
            </button>
          ))}
        </div>

        {tab === "payments" && (
          <div className="rounded-xl border border-border bg-card overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border">
                {["Student", "Description", "Amount", "Date", "Status"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.id} className="border-b border-border last:border-0 hover:bg-muted/50">
                    <td className="px-4 py-3 text-foreground">{p.students?.full_name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{p.description}</td>
                    <td className="px-4 py-3 text-foreground">KES {p.amount_kes?.toLocaleString()}</td>
                    <td className="px-4 py-3 text-muted-foreground">{new Date(p.date).toLocaleDateString("en-GB")}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[p.status] ?? ""}`}>{p.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === "earnings" && (
          <div className="rounded-xl border border-border bg-card overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border">
                {["Tutor", "Description", "Amount", "Date"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {earnings.map((e) => (
                  <tr key={e.id} className="border-b border-border last:border-0 hover:bg-muted/50">
                    <td className="px-4 py-3 text-foreground">{e.tutors?.full_name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{e.description}</td>
                    <td className="px-4 py-3 text-foreground">KES {e.amount_kes?.toLocaleString()}</td>
                    <td className="px-4 py-3 text-muted-foreground">{new Date(e.date).toLocaleDateString("en-GB")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
