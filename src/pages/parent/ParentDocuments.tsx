import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { ParentLayout } from "@/components/layouts/ParentLayout";
import { FileText, Download } from "lucide-react";
import { formatDate } from "@/lib/format";
import { CardSkeleton } from "@/components/ui/CardSkeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { DEMO_DATA } from "@/lib/demoData";

export default function ParentDocuments() {
  const { user, roleOverride } = useAuth();
  const [docs, setDocs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const isDemo = import.meta.env.DEV && roleOverride === "parent";

  useEffect(() => {
    if (!user) return;

    if (isDemo) {
      setLoading(true);
      setLoadError(null);
      setDocs(DEMO_DATA.parent.documents.docs);
      setLoading(false);
      return;
    }

    const fetch = async () => {
      setLoading(true);
      setLoadError(null);

      try {
        const { data: parent, error: parentError } = await supabase
          .from("parents")
          .select("id")
          .eq("user_id", user.id)
          .maybeSingle();

        if (parentError) throw parentError;

        if (!parent) {
          setLoadError("No parent record was found for this account. Ask an admin to create a row in parents for your user.");
          setDocs([]);
          return;
        }

        const { data: students, error: studentsError } = await supabase
          .from("students")
          .select("id")
          .eq("parent_id", parent.id);

        if (studentsError) throw studentsError;

        const ids = students?.map((s) => s.id) ?? [];
        if (ids.length === 0) {
          setDocs([]);
          return;
        }

        const { data, error } = await supabase
          .from("documents")
          .select("*, students(full_name)")
          .in("student_id", ids)
          .order("created_at", { ascending: false });

        if (error) throw error;
        setDocs(data ?? []);
      } catch (err) {
        console.error("ParentDocuments load failed", err);
        setLoadError("We couldn't load your documents.");
        setDocs([]);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [user, isDemo]);

  return (
    <ParentLayout>
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-foreground">Documents</h2>

        {loadError && !loading && (
          <EmptyState title="Account setup needed" description={loadError} icon={FileText} />
        )}

        {loading ? <CardSkeleton count={4} /> : loadError ? null : docs.length === 0 ? (
          <EmptyState title="No documents uploaded" description="Report cards and assessments will appear here." icon={FileText} />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {docs.map((d) => (
              <div key={d.id} className="card-hover-glow rounded-xl border border-border bg-card p-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate font-medium text-foreground">{d.file_name}</p>
                    <p className="text-xs text-muted-foreground">{d.students?.full_name} • {formatDate(d.created_at)}</p>
                  </div>
                </div>
                <a href={d.file_url} target="_blank" rel="noopener noreferrer"
                  className="mt-4 flex items-center gap-2 text-sm text-primary hover:underline">
                  <Download size={14} /> Download
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </ParentLayout>
  );
}
