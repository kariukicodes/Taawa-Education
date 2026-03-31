import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/layouts/AdminLayout";

export default function AdminParents() {
  const [parents, setParents] = useState<any[]>([]);

  useEffect(() => {
    supabase.from("parents").select("*, students(full_name, grade)").then(({ data }) => setParents(data ?? []));
  }, []);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-foreground">Parents</h2>
        <div className="rounded-xl border border-border bg-card overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-border">
              {["Name", "Phone", "Linked Students"].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {parents.map((p) => (
                <tr key={p.id} className="border-b border-border last:border-0 hover:bg-muted/50">
                  <td className="px-4 py-3 text-foreground">{p.full_name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{p.phone}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {p.students?.map((s: any) => (
                        <span key={s.full_name} className="rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground">{s.full_name} ({s.grade})</span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
