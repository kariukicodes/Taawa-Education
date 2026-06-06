import { useEffect, useState } from "react";
import { Download, FileText } from "lucide-react";

import { ParentLayout } from "@/components/layouts/ParentLayout";
import { formatDate } from "@/lib/format";
import { CardSkeleton } from "@/components/ui/CardSkeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { useAuth } from "@/contexts/AuthContext";
import { DEMO_DATA } from "@/lib/demoData";
import { invokeSupabaseFunction } from "@/lib/invokeSupabaseFunction";
import { reportClientError } from "@/lib/reportClientError";
import { toast } from "@/hooks/use-toast";

type DocumentRecord = {
  id: string;
  file_name: string;
  file_url: string;
  created_at: string;
  students: { full_name: string };
};

type ParentWorkspaceResponse = {
  documents: DocumentRecord[];
};

export default function ParentDocuments() {
  const { user, roleOverride, loading: authLoading } = useAuth();
  const [docs, setDocs] = useState<DocumentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const isDemo =
    import.meta.env.DEV &&
    import.meta.env.VITE_ENABLE_DEMO_MODE === "true" &&
    roleOverride === "parent";

  useEffect(() => {
    if (authLoading) return;
    if (!isDemo && !user) return;

    const fetchDocuments = async () => {
      setLoading(true);
      setLoadError(null);

      try {
        const data = isDemo
          ? { documents: DEMO_DATA.parent.documents.docs as DocumentRecord[] }
          : await invokeSupabaseFunction<ParentWorkspaceResponse>(
              "get-parent-workspace",
              undefined,
            );

        setDocs(data.documents ?? []);
      } catch (err) {
        reportClientError("ParentDocuments.fetchDocuments", err);
        const message = err instanceof Error ? err.message : String(err);
        setLoadError(message);
        setDocs([]);
        toast({
          title: "Failed to load documents",
          description: message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    void fetchDocuments();
  }, [authLoading, isDemo, user?.id]);

  return (
    <ParentLayout>
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-foreground">Documents</h2>

        {loadError && !loading && (
          <EmptyState title="Account setup needed" description={loadError} icon={FileText} />
        )}

        {loading ? (
          <CardSkeleton count={4} />
        ) : loadError ? null : docs.length === 0 ? (
          <EmptyState
            title="No documents uploaded"
            description="Report cards and assessments will appear here."
            icon={FileText}
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {docs.map((doc) => (
              <div
                key={doc.id}
                className="card-hover-glow rounded-xl border border-border bg-card p-5"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-foreground">{doc.file_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {doc.students?.full_name} | {formatDate(doc.created_at)}
                    </p>
                  </div>
                </div>

                <a
                  href={doc.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 flex items-center gap-2 text-sm text-primary hover:underline"
                >
                  <Download size={14} />
                  Download
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </ParentLayout>
  );
}
