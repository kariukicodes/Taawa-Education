import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { ParentLayout } from "@/components/layouts/ParentLayout";
import { FileText, Download } from "lucide-react";

export default function ParentDocuments() {
  const { user } = useAuth();
  const [docs, setDocs] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const { data: parent } = await supabase.from("parents").select("id").eq("user_id", user.id).single();
      if (!parent) return;
      const { data: students } = await supabase.from("students").select("id").eq("parent_id", parent.id);
      const ids = students?.map((s) => s.id) ?? [];
      if (ids.length === 0) return;
      const { data } = await supabase.from("documents").select("*, students(full_name)").in("student_id", ids).order("created_at", { ascending: false });
      setDocs(data ?? []);
    };
    fetch();
  }, [user]);

  return (
    <ParentLayout>
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-foreground">Documents</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {docs.map((d) => (
            <div key={d.id} className="card-hover-glow rounded-xl border border-border bg-card p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate font-medium text-foreground">{d.file_name}</p>
                  <p className="text-xs text-muted-foreground">{d.students?.full_name} • {new Date(d.created_at).toLocaleDateString("en-GB")}</p>
                </div>
              </div>
              <a
                href={d.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 flex items-center gap-2 text-sm text-primary hover:underline"
              >
                <Download size={14} /> Download
              </a>
            </div>
          ))}
          {docs.length === 0 && <p className="text-muted-foreground">No documents uploaded yet.</p>}
        </div>
      </div>
    </ParentLayout>
  );
}
