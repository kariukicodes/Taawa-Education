import { TeacherLayout } from "@/components/layouts/TeacherLayout";
export default function TeacherOverview() {
  return <TeacherLayout><div className="space-y-6"><h2 className="text-2xl font-bold text-foreground">My Students</h2><p className="text-muted-foreground">Your teacher portal is ready. Select a section from the sidebar to get started.</p></div></TeacherLayout>;
}
