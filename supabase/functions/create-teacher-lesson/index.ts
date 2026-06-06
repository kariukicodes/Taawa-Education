import { requireTeacher } from "../_shared/admin.ts";
import { corsHeaders, jsonResponse } from "../_shared/http.ts";
import { logFunctionError } from "../_shared/log.ts";

interface CreateTeacherLessonBody {
  student_id?: string;
  subject?: string;
  date?: string;
  topics_covered?: string;
  homework?: string | null;
  performance_rating?: "Excellent" | "Good" | "Needs Improvement" | null;
  comments?: string | null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed." }, { status: 405 });
  }

  const auth = await requireTeacher(req);
  if ("error" in auth) return auth.error;

  const body = (await req.json()) as CreateTeacherLessonBody;
  if (!body.student_id) {
    return jsonResponse({ error: "Student selection is required." }, { status: 400 });
  }
  if (!body.subject?.trim()) {
    return jsonResponse({ error: "Subject is required." }, { status: 400 });
  }
  if (!body.date) {
    return jsonResponse({ error: "Lesson date is required." }, { status: 400 });
  }
  if (!body.topics_covered?.trim()) {
    return jsonResponse({ error: "Topics covered are required." }, { status: 400 });
  }

  const { adminSupabase, user } = auth;

  try {
    const { data: tutor, error: tutorError } = await adminSupabase
      .from("tutors")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (tutorError || !tutor) throw tutorError ?? new Error("Tutor profile not found.");

    const { data: assignedStudent, error: assignmentError } = await adminSupabase
      .from("tutor_assignments")
      .select("student_id")
      .eq("tutor_id", tutor.id)
      .eq("student_id", body.student_id)
      .maybeSingle();

    if (assignmentError || !assignedStudent) {
      throw assignmentError ?? new Error("You can only submit lessons for your assigned students.");
    }

    const { data: lesson, error: lessonError } = await adminSupabase
      .from("lessons")
      .insert({
        tutor_id: tutor.id,
        student_id: body.student_id,
        subject: body.subject.trim(),
        date: body.date,
        topics_covered: body.topics_covered.trim(),
        homework: body.homework?.trim() || null,
        performance_rating: body.performance_rating ?? null,
        comments: body.comments?.trim() || null,
      })
      .select("id, student_id, tutor_id, subject, date, topics_covered, homework, performance_rating, comments, created_at")
      .single();

    if (lessonError || !lesson) throw lessonError ?? new Error("Lesson report could not be saved.");

    const { data: student, error: studentError } = await adminSupabase
      .from("students")
      .select("full_name")
      .eq("id", body.student_id)
      .single();

    if (studentError || !student) throw studentError ?? new Error("Student not found.");

    return jsonResponse({
      lesson: {
        ...lesson,
        students: { full_name: student.full_name },
      },
    });
  } catch (error) {
    logFunctionError("create-teacher-lesson", error, {
      user_id: user.id,
      student_id: body.student_id,
    });

    return jsonResponse(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 400 },
    );
  }
});
