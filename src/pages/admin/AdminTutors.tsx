import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/layouts/AdminLayout";
import { Plus, X } from "lucide-react";

export default function AdminTutors() {
  const [tutors, setTutors] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ full_name: "", email: "", phone: "", subjects: "", rate_kes: "", status: "active" });

  const fetchTutors = async () => {
    const { data } = await supabase.from("tutors").select("*, tutor_assignments(student_id)");
    setTutors(data ?? []);
  };

  useEffect(() => { fetchTutors(); }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    // For MVP, we create tutor record without auth user creation
    // In production, this would send an invite
    const subjects = form.subjects.split(",").map((s) => s.trim()).filter(Boolean);
    await supabase.from("tutors").insert({
      full_name: form.full_name,
      phone: form.phone,
      subjects,
      rate_kes: parseInt(form.rate_kes) || 0,
      status: form.status,
      user_id: "00000000-0000-0000-0000-000000000000", // placeholder
    } as any);
    setShowModal(false);
    fetchTutors();
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground">Tutors</h2>
          <button onClick={() => setShowModal(true)} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
            <Plus size={16} />Add Tutor
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tutors.map((t) => (
            <div key={t.id} className="card-hover-glow rounded-xl border border-border bg-card p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 text-sm font-bold text-primary">
                  {t.full_name?.split(" ").map((n: string) => n[0]).join("")}
                </div>
                <div>
                  <p className="font-semibold text-foreground">{t.full_name}</p>
                  <span className={`text-xs font-medium ${t.status === "active" ? "text-secondary" : "text-muted-foreground"}`}>
                    {t.status === "active" ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Students</span>
                  <span className="text-foreground">{t.tutor_assignments?.length ?? 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Rate</span>
                  <span className="text-foreground">KES {t.rate_kes?.toLocaleString()}</span>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {t.subjects?.map((sub: string) => (
                    <span key={sub} className="rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground">{sub}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showModal && (
        <>
          <div className="fixed inset-0 z-40 bg-background/60" onClick={() => setShowModal(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-lg rounded-xl border border-border bg-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">Add New Tutor</h3>
                <button onClick={() => setShowModal(false)}><X className="h-5 w-5 text-muted-foreground" /></button>
              </div>
              <form onSubmit={handleAdd} className="space-y-4">
                <input placeholder="Full Name" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} required className="w-full rounded-lg border border-border bg-muted px-4 py-2 text-sm text-foreground focus:border-primary focus:outline-none" />
                <input placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full rounded-lg border border-border bg-muted px-4 py-2 text-sm text-foreground focus:border-primary focus:outline-none" />
                <input placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full rounded-lg border border-border bg-muted px-4 py-2 text-sm text-foreground focus:border-primary focus:outline-none" />
                <input placeholder="Subjects (comma separated)" value={form.subjects} onChange={(e) => setForm({ ...form, subjects: e.target.value })} className="w-full rounded-lg border border-border bg-muted px-4 py-2 text-sm text-foreground focus:border-primary focus:outline-none" />
                <input type="number" placeholder="Rate (KES)" value={form.rate_kes} onChange={(e) => setForm({ ...form, rate_kes: e.target.value })} className="w-full rounded-lg border border-border bg-muted px-4 py-2 text-sm text-foreground focus:border-primary focus:outline-none" />
                <button type="submit" className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90">Add Tutor</button>
              </form>
            </div>
          </div>
        </>
      )}
    </AdminLayout>
  );
}
