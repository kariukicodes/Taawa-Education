import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { ParentLayout } from "@/components/layouts/ParentLayout";
import { BookOpen, ClipboardCheck, TrendingUp, CreditCard } from "lucide-react";

export default function ParentOverview() {
  const { user } = useAuth();
  const [parentName, setParentName] = useState("");
  const [stats, setStats] = useState({ lessonsThisWeek: 0, attendanceRate: 0, latestRating: "—", pendingPayments: 0 });
  const [recentLessons, setRecentLessons] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const { data: parent } = await supabase.from("parents").select("id, full_name").eq("user_id", user.id).single();
      if (!parent) return;
      setParentName(parent.full_name.split(" ")[0]);

      const { data: students } = await supabase.from("students").select("id").eq("parent_id", parent.id);
      const studentIds = students?.map((s) => s.id) ?? [];
      if (studentIds.length === 0) return;

      const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7);
      const [lessons, attendance, payments, recent] = await Promise.all([
        supabase.from("lessons").select("id").in("student_id", studentIds).gte("date", weekAgo.toISOString().split("T")[0]),
        supabase.from("attendance").select("status").in("student_id", studentIds),
        supabase.from("payments").select("amount_kes").in("student_id", studentIds).in("status", ["Pending", "Overdue"]),
        supabase.from("lessons").select("*, students(full_name), tutors(full_name)").in("student_id", studentIds).order("date", { ascending: false }).limit(3),
      ]);

      const totalAtt = attendance.data?.length ?? 0;
      const presentAtt = attendance.data?.filter((a) => a.status === "present").length ?? 0;
      const pendingTotal = payments.data?.reduce((s, p) => s + p.amount_kes, 0) ?? 0;
      const latestLesson = recent.data?.[0];

      setStats({
        lessonsThisWeek: lessons.data?.length ?? 0,
        attendanceRate: totalAtt > 0 ? Math.round((presentAtt / totalAtt) * 100) : 0,
        latestRating: latestLesson?.performance_rating ?? "—",
        pendingPayments: pendingTotal,
      });
      setRecentLessons(recent.data ?? []);
    };
    fetch();
  }, [user]);

  const ratingColors: Record<string, string> = {
    Excellent: "bg-secondary/20 text-secondary",
    Good: "bg-primary/20 text-primary",
    "Needs Improvement": "bg-destructive/20 text-destructive",
  };

  const kpis = [
    { label: "Lessons This Week", value: stats.lessonsThisWeek, icon: BookOpen },
    { label: "Attendance Rate", value: `${stats.attendanceRate}%`, icon: ClipboardCheck },
    { label: "Latest Rating", value: stats.latestRating, icon: TrendingUp },
    { label: "Pending Payments", value: `KES ${stats.pendingPayments.toLocaleString()}`, icon: CreditCard },
  ];

  return (
    <ParentLayout>
      <div className="space-y-8">
        <h2 className="text-2xl font-bold text-foreground">Welcome back, {parentName || "Parent"}</h2>

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

        <div>
          <h3 className="mb-4 text-lg font-semibold text-foreground">Recent Tutor Reports</h3>
          <div className="space-y-3">
            {recentLessons.map((l) => (
              <div key={l.id} className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">{l.students?.full_name} — {l.subject}</p>
                    <p className="text-xs text-muted-foreground">{new Date(l.date).toLocaleDateString("en-GB")} • {l.tutors?.full_name}</p>
                  </div>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${ratingColors[l.performance_rating] ?? "bg-muted text-muted-foreground"}`}>
                    {l.performance_rating}
                  </span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{l.comments}</p>
              </div>
            ))}
            {recentLessons.length === 0 && <p className="text-sm text-muted-foreground">No reports yet.</p>}
          </div>
        </div>
      </div>
    </ParentLayout>
  );
}
