import { requireTeacher } from "../_shared/admin.ts";
import { corsHeaders, jsonResponse } from "../_shared/http.ts";
import { logFunctionError } from "../_shared/log.ts";

interface ManageTeacherAttendanceBody {
  attendance_id?: string;
  lesson_date?: string;
  status?: "present" | "absent" | "excused";
  student_id?: string;
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

  const body = (await req.json()) as ManageTeacherAttendanceBody;
  if (!body.student_id) {
    return jsonResponse({ error: "Student selection is required." }, { status: 400 });
  }
  if (!body.lesson_date) {
    return jsonResponse({ error: "Lesson date is required." }, { status: 400 });
  }
  if (!body.status || !["present", "absent", "excused"].includes(body.status)) {
    return jsonResponse({ error: "A valid attendance status is required." }, { status: 400 });
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
      throw assignmentError ?? new Error("You can only mark attendance for your assigned students.");
    }

    let attendanceId = body.attendance_id ?? null;

    if (!attendanceId) {
      const { data: existingRecord, error: existingError } = await adminSupabase
        .from("attendance")
        .select("id")
        .eq("tutor_id", tutor.id)
        .eq("student_id", body.student_id)
        .eq("lesson_date", body.lesson_date)
        .maybeSingle();

      if (existingError) throw existingError;
      attendanceId = existingRecord?.id ?? null;
    }

    const query = attendanceId
      ? adminSupabase
          .from("attendance")
          .update({
            lesson_date: body.lesson_date,
            status: body.status,
          })
          .eq("id", attendanceId)
          .eq("tutor_id", tutor.id)
      : adminSupabase.from("attendance").insert({
          student_id: body.student_id,
          tutor_id: tutor.id,
          lesson_date: body.lesson_date,
          status: body.status,
        });

    const { data: attendance, error: attendanceError } = await query
      .select("id, student_id, tutor_id, lesson_date, status, created_at")
      .single();

    if (attendanceError || !attendance) {
      throw attendanceError ?? new Error("Attendance record could not be saved.");
    }

    const { data: student, error: studentError } = await adminSupabase
      .from("students")
      .select("full_name")
      .eq("id", body.student_id)
      .single();

    if (studentError || !student) throw studentError ?? new Error("Student not found.");

    return jsonResponse({
      attendance: {
        ...attendance,
        students: { full_name: student.full_name },
      },
    });
  } catch (error) {
    logFunctionError("manage-teacher-attendance", error, {
      user_id: user.id,
      student_id: body.student_id,
      attendance_id: body.attendance_id,
    });

    return jsonResponse(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 400 },
    );
  }
});
