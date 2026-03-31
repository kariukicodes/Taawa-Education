import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { ParentLayout } from "@/components/layouts/ParentLayout";

export default function ParentBilling() {
  const { user } = useAuth();
  const [payments, setPayments] = useState<any[]>([]);
  const [outstanding, setOutstanding] = useState(0);

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const { data: parent } = await supabase.from("parents").select("id").eq("user_id", user.id).single();
      if (!parent) return;
      const { data: students } = await supabase.from("students").select("id").eq("parent_id", parent.id);
      const ids = students?.map((s) => s.id) ?? [];
      if (ids.length === 0) return;
      const { data } = await supabase.from("payments").select("*, students(full_name)").in("student_id", ids).order("date", { ascending: false });
      setPayments(data ?? []);
      const total = data?.filter((p) => p.status !== "Paid").reduce((s, p) => s + p.amount_kes, 0) ?? 0;
      setOutstanding(total);
    };
    fetch();
  }, [user]);

  const statusColors: Record<string, string> = {
    Paid: "bg-secondary/20 text-secondary",
    Pending: "bg-primary/20 text-primary",
    Overdue: "bg-destructive/20 text-destructive",
  };

  return (
    <ParentLayout>
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-foreground">Billing</h2>

        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-sm text-muted-foreground">Outstanding Balance</p>
          <p className="mt-1 text-3xl font-bold text-foreground">KES {outstanding.toLocaleString()}</p>
        </div>

        <div className="rounded-xl border border-border bg-card overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-border">
              {["Student", "Description", "Amount", "Date", "Status"].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.id} className="border-b border-border last:border-0">
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
      </div>
    </ParentLayout>
  );
}
