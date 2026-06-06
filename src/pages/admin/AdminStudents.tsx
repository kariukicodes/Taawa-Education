import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/layouts/AdminLayout";
import { Plus, Search, X, GraduationCap } from "lucide-react";
import { CardSkeleton } from "@/components/ui/CardSkeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { ConfirmActionDialog } from "@/components/ui/ConfirmActionDialog";
import { useAuth } from "@/contexts/AuthContext";
import { DEMO_DATA } from "@/lib/demoData";
import { toast } from "@/hooks/use-toast";
import { invokeSupabaseFunction } from "@/lib/invokeSupabaseFunction";
import { includesSearchTerm, sortByKey } from "@/lib/adminFilters";
import { validateStudentInput } from "@/lib/adminFormValidation";
import { reportClientError } from "@/lib/reportClientError";

type ParentOption = {
  id: string;
  full_name: string;
  phone: string | null;
  user_id: string | null;
  status?: string;
  archived_at?: string | null;
  created_at?: string;
  students: Array<{ full_name: string; grade: string | null }>;
};

type TutorOption = {
  id: string;
  full_name: string;
  phone: string | null;
  rate_kes: number | null;
  status: string;
  user_id: string | null;
  created_at?: string;
  tutor_assignments: Array<Record<string, never>>;
};

type StudentRecord = {
  id: string;
  parent_id: string;
  full_name: string;
  age: number | null;
  grade: string | null;
  curriculum: string | null;
  status: string;
  archived_at?: string | null;
  created_at?: string;
  parents: { full_name: string | null } | null;
  tutor_assignments: Array<{ tutor_id?: string; tutors: { full_name: string } }>;
};

type StudentFormState = {
  full_name: string;
  age: string;
  grade: string;
  curriculum: string;
  parent_id: string;
  create_new_parent: boolean;
  parent_full_name: string;
  parent_email: string;
  parent_password: string;
  parent_phone: string;
  tutor_id: string;
};

const initialForm: StudentFormState = {
  full_name: "",
  age: "",
  grade: "",
  curriculum: "CBC",
  parent_id: "",
  create_new_parent: false,
  parent_full_name: "",
  parent_email: "",
  parent_password: "",
  parent_phone: "",
  tutor_id: "",
};

export default function AdminStudents() {
  const { roleOverride, loading: authLoading, user } = useAuth();
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [parents, setParents] = useState<ParentOption[]>([]);
  const [tutors, setTutors] = useState<TutorOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<StudentRecord | null>(null);
  const [formError, setFormError] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);
  const [form, setForm] = useState<StudentFormState>(initialForm);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name-asc");
  const [pendingDeleteStudent, setPendingDeleteStudent] = useState<StudentRecord | null>(null);

  const isDemo =
    import.meta.env.DEV &&
    import.meta.env.VITE_ENABLE_DEMO_MODE === "true" &&
    roleOverride === "admin";

  const resetForm = (student?: StudentRecord | null) => {
    setEditingStudent(student ?? null);
    setForm(
      student
        ? {
            full_name: student.full_name,
            age: student.age?.toString() ?? "",
            grade: student.grade ?? "",
            curriculum: student.curriculum ?? "CBC",
            parent_id: student.parent_id,
            create_new_parent: false,
            parent_full_name: "",
            parent_email: "",
            parent_password: "",
            parent_phone: "",
            tutor_id: student.tutor_assignments?.[0]?.tutor_id ?? "",
          }
        : initialForm,
    );
    setFormError("");
  };

  const closeModal = () => {
    setShowModal(false);
    resetForm();
  };

  const fetchData = async (showLoader = true) => {
    if (showLoader) {
      setLoading(true);
    }

    if (isDemo) {
      setStudents(DEMO_DATA.admin.students.students as StudentRecord[]);
      setParents(DEMO_DATA.admin.students.parents as ParentOption[]);
      setTutors(DEMO_DATA.admin.students.tutors as TutorOption[]);
      if (showLoader) setLoading(false);
      return;
    }

    try {
      const [{ students }, { parents }, { tutors }] = await Promise.all([
        invokeSupabaseFunction<{ students: StudentRecord[] }>("list-students-admin", undefined),
        invokeSupabaseFunction<{ parents: ParentOption[] }>("list-parents-admin", undefined),
        invokeSupabaseFunction<{ tutors: TutorOption[] }>("list-tutors-admin", undefined),
      ]);

      setStudents(students ?? []);
      setParents(parents ?? []);
      setTutors(tutors ?? []);
    } catch (err) {
      reportClientError("AdminStudents.fetchData", err);
      const message = err instanceof Error ? err.message : String(err);
      toast({
        title: "Failed to load admin student data",
        description: message,
        variant: "destructive",
      });
    } finally {
      if (showLoader) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    if (authLoading) return;
    if (!isDemo && !user) return;
    void fetchData();
  }, [isDemo, authLoading, user?.id]);

  const filteredStudents = sortByKey(
    students.filter((student) => {
      const tutorName = student.tutor_assignments?.[0]?.tutors?.full_name ?? "";
      const matchesSearch = includesSearchTerm(
        [
          student.full_name,
          student.grade,
          student.curriculum,
          student.status,
          student.parents?.full_name,
          tutorName,
          student.age,
        ],
        search,
      );
      const matchesStatus = statusFilter === "all" || student.status === statusFilter;
      return matchesSearch && matchesStatus;
    }),
    (student) => {
      switch (sortBy) {
        case "parent-asc":
          return student.parents?.full_name ?? "";
        case "grade-asc":
          return student.grade ?? "";
        case "recent-desc":
          return student.created_at ?? "";
        case "name-asc":
        default:
          return student.full_name;
      }
    },
    sortBy === "recent-desc" ? "desc" : "asc",
  );

  const upsertStudent = (student: StudentRecord) => {
    setStudents((prev) => {
      const exists = prev.some((item) => item.id === student.id);
      if (!exists) return [student, ...prev];
      return prev.map((item) => (item.id === student.id ? student : item));
    });
  };

  const validateForm = () =>
    validateStudentInput(
      {
        full_name: form.full_name,
        age: form.age,
        grade: form.grade,
        create_new_parent: form.create_new_parent,
        parent_id: form.parent_id,
        parent_full_name: form.parent_full_name,
        parent_email: form.parent_email,
        parent_password: form.parent_password,
      },
      editingStudent ? "edit" : "create",
    );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    const validationError = validateForm();
    if (validationError) {
      setFormError(validationError);
      return;
    }

    const age = parseInt(form.age, 10);

    if (isDemo) {
      const selectedParentName =
        parents.find((parent) => parent.id === form.parent_id)?.full_name ??
        form.parent_full_name;
      const selectedTutorName = tutors.find((tutor) => tutor.id === form.tutor_id)?.full_name;

      const demoStudent: StudentRecord = {
        id: editingStudent?.id ?? `demo_student_${Date.now()}`,
        parent_id: form.parent_id || `demo_parent_${Date.now()}`,
        full_name: form.full_name,
        age,
        grade: form.grade,
        curriculum: form.curriculum,
        status: editingStudent?.status ?? "active",
        archived_at: editingStudent?.archived_at ?? null,
        parents: selectedParentName ? { full_name: selectedParentName } : null,
        tutor_assignments: selectedTutorName
          ? [{ tutor_id: form.tutor_id, tutors: { full_name: selectedTutorName } }]
          : [],
      };

      upsertStudent(demoStudent);
      closeModal();
      toast({
        title: editingStudent ? "Student updated" : "Student added",
        description: editingStudent
          ? "Demo student updated locally."
          : "Demo student created locally.",
      });
      return;
    }

    try {
      if (editingStudent) {
        const { student } = await invokeSupabaseFunction<{ student: StudentRecord }>(
          "manage-student-admin",
          {
            action: "update",
            student_id: editingStudent.id,
            full_name: form.full_name,
            age,
            grade: form.grade,
            curriculum: form.curriculum,
            parent_id: form.parent_id,
            tutor_id: form.tutor_id || null,
          },
        );

        upsertStudent(student);

        toast({
          title: "Student updated",
          description: "Student details saved successfully.",
        });
      } else {
        const payload = form.create_new_parent
          ? {
              full_name: form.full_name,
              age,
              grade: form.grade,
              curriculum: form.curriculum,
              tutor_id: form.tutor_id || undefined,
              parent: {
                full_name: form.parent_full_name,
                email: form.parent_email,
                password: form.parent_password,
                phone: form.parent_phone || null,
              },
            }
          : {
              full_name: form.full_name,
              age,
              grade: form.grade,
              curriculum: form.curriculum,
              tutor_id: form.tutor_id || undefined,
              parent_id: form.parent_id,
            };

        const { student, parent } = await invokeSupabaseFunction<{
          student: StudentRecord;
          parent: { id: string; full_name: string | null } | null;
        }>("create-student-admin", payload);

        upsertStudent(student);

        if (parent && !parents.some((existingParent) => existingParent.id === parent.id)) {
          setParents((prev) => [
            {
              ...parent,
              phone: null,
              user_id: null,
              students: [],
            },
            ...prev,
          ]);
        }

        toast({
          title: "Student added",
          description: "Student record created successfully.",
        });
      }

      closeModal();
      void fetchData(false);
    } catch (err) {
      reportClientError("AdminStudents.handleSubmit", err, {
        studentId: editingStudent?.id,
      });
      const message = err instanceof Error ? err.message : String(err);
      setFormError(message);
      toast({
        title: editingStudent ? "Failed to update student" : "Failed to add student",
        description: message,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (student: StudentRecord) => {
    setSavingId(student.id);

    try {
      if (isDemo) {
        setStudents((prev) => prev.filter((item) => item.id !== student.id));
      } else {
        await invokeSupabaseFunction("manage-student-admin", {
          action: "delete",
          student_id: student.id,
        });

        setStudents((prev) => prev.filter((item) => item.id !== student.id));
      }

      toast({
        title: "Student deleted",
        description: `${student.full_name} has been removed.`,
      });
    } catch (err) {
      reportClientError("AdminStudents.handleDelete", err, {
        studentId: student.id,
      });
      const message = err instanceof Error ? err.message : String(err);
      toast({
        title: "Failed to delete student",
        description: message,
        variant: "destructive",
      });
    } finally {
      setSavingId(null);
      setPendingDeleteStudent(null);
    }
  };

  const handleArchiveToggle = async (student: StudentRecord) => {
    const action = student.status === "active" ? "archive" : "restore";
    setSavingId(student.id);

    try {
      if (isDemo) {
        upsertStudent({
          ...student,
          status: action === "archive" ? "inactive" : "active",
          archived_at: action === "archive" ? new Date().toISOString() : null,
        });
      } else {
        const { student: updatedStudent } = await invokeSupabaseFunction<{ student: StudentRecord }>(
          "manage-student-admin",
          {
            action,
            student_id: student.id,
          },
        );

        upsertStudent(updatedStudent);
      }

      toast({
        title: action === "archive" ? "Student archived" : "Student restored",
        description: `${student.full_name} is now ${action === "archive" ? "inactive" : "active"}.`,
      });
    } catch (err) {
      reportClientError("AdminStudents.handleArchiveToggle", err, {
        studentId: student.id,
        action,
      });
      const message = err instanceof Error ? err.message : String(err);
      toast({
        title: `Failed to ${action} student`,
        description: message,
        variant: "destructive",
      });
    } finally {
      setSavingId(null);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground">Students</h2>

          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            <Plus size={16} />
            Add Student
          </button>
        </div>

        <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by student, parent, tutor, grade, or curriculum..."
              className="w-full rounded-lg border border-border bg-muted py-2 pl-10 pr-4 text-sm text-foreground focus:border-primary focus:outline-none"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-border bg-muted px-4 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Archived</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="rounded-lg border border-border bg-muted px-4 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
          >
            <option value="name-asc">Sort by Name</option>
            <option value="parent-asc">Sort by Parent</option>
            <option value="grade-asc">Sort by Grade</option>
            <option value="recent-desc">Sort by Newest</option>
          </select>
        </div>

        {loading ? (
          <CardSkeleton count={6} />
        ) : filteredStudents.length === 0 ? (
          <EmptyState
            title={students.length === 0 ? "No students enrolled" : "No students match these filters"}
            description={
              students.length === 0
                ? "Add your first student to get started."
                : "Try a different search term, status filter, or sort option."
            }
            icon={GraduationCap}
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredStudents.map((student) => {
              const tutorName = student.tutor_assignments?.[0]?.tutors?.full_name;

              return (
                <div
                  key={student.id}
                  className="card-hover-glow rounded-xl border border-border bg-card p-5"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 text-sm font-bold text-primary">
                      {student.full_name
                        ?.split(" ")
                        .map((name) => name[0])
                        .join("")}
                    </div>

                    <div>
                      <p className="font-semibold text-foreground">{student.full_name}</p>
                      <p className="text-xs text-muted-foreground">Grade {student.grade}</p>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status</span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          student.status === "active"
                            ? "bg-secondary/20 text-secondary"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {student.status === "active" ? "Active" : "Archived"}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Parent</span>
                      <span className="text-foreground">{student.parents?.full_name ?? "Not set"}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Curriculum</span>
                      <span className="rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-xs text-primary">
                        {student.curriculum}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tutor</span>
                      <span className="text-foreground">{tutorName ?? "Unassigned"}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Age</span>
                      <span className="text-foreground">{student.age ?? "-"}</span>
                    </div>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        resetForm(student);
                        setShowModal(true);
                      }}
                      className="flex-1 rounded-lg border border-border px-3 py-2 text-xs font-medium text-foreground hover:bg-muted"
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      disabled={savingId === student.id}
                      onClick={() => void handleArchiveToggle(student)}
                      className="rounded-lg border border-border px-3 py-2 text-xs font-medium text-foreground hover:bg-muted disabled:opacity-50"
                    >
                      {student.status === "active" ? "Archive" : "Restore"}
                    </button>

                    <button
                      type="button"
                      disabled={savingId === student.id}
                      onClick={() => setPendingDeleteStudent(student)}
                      className="rounded-lg border border-destructive/30 px-3 py-2 text-xs font-medium text-destructive hover:bg-destructive/10 disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showModal && (
        <>
          <div className="fixed inset-0 z-40 bg-background/60" onClick={closeModal} />

          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-lg rounded-xl border border-border bg-card p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground">
                  {editingStudent ? "Edit Student" : "Add New Student"}
                </h3>

                <button onClick={closeModal}>
                  <X className="h-5 w-5 text-muted-foreground" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {formError && (
                  <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                    {formError}
                  </div>
                )}

                <input
                  placeholder="Student Full Name"
                  value={form.full_name}
                  onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                  required
                  className="w-full rounded-lg border border-border bg-muted px-4 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                />

                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="number"
                    placeholder="Age"
                    value={form.age}
                    onChange={(e) => setForm({ ...form, age: e.target.value })}
                    required
                    className="rounded-lg border border-border bg-muted px-4 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                  />

                  <input
                    placeholder="Grade"
                    value={form.grade}
                    onChange={(e) => setForm({ ...form, grade: e.target.value })}
                    required
                    className="rounded-lg border border-border bg-muted px-4 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                  />
                </div>

                <select
                  value={form.curriculum}
                  onChange={(e) => setForm({ ...form, curriculum: e.target.value })}
                  className="w-full rounded-lg border border-border bg-muted px-4 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                >
                  {["CBC", "British", "Montessori", "Custom"].map((curriculum) => (
                    <option key={curriculum} value={curriculum}>
                      {curriculum}
                    </option>
                  ))}
                </select>

                {!editingStudent && (
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm text-foreground">
                      <input
                        type="checkbox"
                        checked={form.create_new_parent}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            create_new_parent: e.target.checked,
                            parent_id: e.target.checked ? "" : form.parent_id,
                          })
                        }
                      />
                      Parent not listed? Add parent now
                    </label>
                  </div>
                )}

                {editingStudent || !form.create_new_parent ? (
                  <select
                    value={form.parent_id}
                    onChange={(e) => setForm({ ...form, parent_id: e.target.value })}
                    required
                    className="w-full rounded-lg border border-border bg-muted px-4 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                  >
                    <option value="">Select Parent</option>
                    {parents.map((parent) => (
                      <option key={parent.id} value={parent.id}>
                        {parent.full_name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      This creates a parent login account and links the student to it.
                    </p>

                    <input
                      placeholder="Parent Full Name"
                      value={form.parent_full_name}
                      onChange={(e) => setForm({ ...form, parent_full_name: e.target.value })}
                      required
                      className="w-full rounded-lg border border-border bg-muted px-4 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                    />

                    <input
                      type="email"
                      placeholder="Parent Email"
                      value={form.parent_email}
                      onChange={(e) => setForm({ ...form, parent_email: e.target.value })}
                      required
                      className="w-full rounded-lg border border-border bg-muted px-4 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                    />

                    <input
                      type="password"
                      placeholder="Parent Temporary Password"
                      value={form.parent_password}
                      onChange={(e) => setForm({ ...form, parent_password: e.target.value })}
                      minLength={8}
                      required
                      className="w-full rounded-lg border border-border bg-muted px-4 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                    />

                    <input
                      placeholder="Parent Phone"
                      value={form.parent_phone}
                      onChange={(e) => setForm({ ...form, parent_phone: e.target.value })}
                      className="w-full rounded-lg border border-border bg-muted px-4 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                    />
                  </div>
                )}

                <select
                  value={form.tutor_id}
                  onChange={(e) => setForm({ ...form, tutor_id: e.target.value })}
                  className="w-full rounded-lg border border-border bg-muted px-4 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                >
                  <option value="">Assign Tutor (optional)</option>
                  {tutors.map((tutor) => (
                    <option key={tutor.id} value={tutor.id}>
                      {tutor.full_name}
                    </option>
                  ))}
                </select>

                {editingStudent && (
                  <p className="text-xs text-muted-foreground">
                    Use this form to update student details, reassign the parent, or change the assigned tutor.
                  </p>
                )}

                <button
                  type="submit"
                  className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
                >
                  {editingStudent ? "Save Student" : "Add Student"}
                </button>
              </form>
            </div>
          </div>
        </>
      )}

      <ConfirmActionDialog
        open={Boolean(pendingDeleteStudent)}
        onOpenChange={(open) => {
          if (!open) setPendingDeleteStudent(null);
        }}
        title="Delete student?"
        description={
          pendingDeleteStudent
            ? `This removes ${pendingDeleteStudent.full_name}'s student record and linked assignment history.`
            : ""
        }
        confirmLabel="Delete Student"
        onConfirm={() => pendingDeleteStudent && handleDelete(pendingDeleteStudent)}
      />
    </AdminLayout>
  );
}
