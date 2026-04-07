import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/layouts/AdminLayout";
import { UserCircle } from "lucide-react";
import { TableSkeleton } from "@/components/ui/TableSkeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { useAuth } from "@/contexts/AuthContext";
import { DEMO_DATA } from "@/lib/demoData";

export default function AdminParents() {
  const { roleOverride } = useAuth();
  const [parents, setParents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const isDemo = import.meta.env.DEV && roleOverride === "admin";

  useEffect(() => {
    if (isDemo) {
      setLoading(true);
      setParents(DEMO_DATA.admin.parents.parents);
      setLoading(false);
      return;
    }

    supabase.from("parents").select("*, students(full_name, grade)").then(({ data }) => {
      setParents(data ?? []);
      setLoading(false);
    });
  }, [isDemo]);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-foreground">Parents</h2>

        {loading ? <TableSkeleton columns={3} /> : parents.length === 0 ? (
          <EmptyState title="No parents yet" description="Parent accounts will appear here once created." icon={UserCircle} />
        ) : (
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
        )}
      </div>
    </AdminLayout>
  );
}
