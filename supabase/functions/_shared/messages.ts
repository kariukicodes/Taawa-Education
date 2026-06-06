import { getAuthUserDetails } from "./account.ts";

type ViewerRole = "parent" | "teacher";

type ThreadRow = {
  id: string;
  parent_id: string;
  tutor_id: string;
  student_id: string;
  parent_last_read_at: string | null;
  tutor_last_read_at: string | null;
  last_message_at: string;
};

type MessageRow = {
  id: string;
  thread_id: string;
  sender_user_id: string;
  sender_role: "admin" | "parent" | "teacher";
  body: string;
  created_at: string;
};

export async function resolveTutorProfile(adminSupabase: any, userId: string) {
  const { data, error } = await adminSupabase
    .from("tutors")
    .select("id, full_name, phone, user_id")
    .eq("user_id", userId)
    .single();

  if (error || !data) {
    throw error ?? new Error("Tutor profile not found.");
  }

  return data;
}

export async function resolveParentProfile(adminSupabase: any, userId: string) {
  const { data, error } = await adminSupabase
    .from("parents")
    .select("id, full_name, phone, user_id")
    .eq("user_id", userId)
    .single();

  if (error || !data) {
    throw error ?? new Error("Parent profile not found.");
  }

  return data;
}

export async function ensureMessageThreadForTeacher(adminSupabase: any, tutorId: string, studentId: string, createdBy: string) {
  const { data: student, error: studentError } = await adminSupabase
    .from("students")
    .select("id, parent_id")
    .eq("id", studentId)
    .single();

  if (studentError || !student) {
    throw studentError ?? new Error("Student not found.");
  }

  const { data: assignment, error: assignmentError } = await adminSupabase
    .from("tutor_assignments")
    .select("id")
    .eq("student_id", studentId)
    .eq("tutor_id", tutorId)
    .maybeSingle();

  if (assignmentError) throw assignmentError;
  if (!assignment) {
    throw new Error("Only assigned tutors can start or continue this conversation.");
  }

  const { data: existingThread, error: existingThreadError } = await adminSupabase
    .from("message_threads")
    .select("id")
    .eq("student_id", studentId)
    .eq("tutor_id", tutorId)
    .eq("parent_id", student.parent_id)
    .maybeSingle();

  if (existingThreadError) throw existingThreadError;
  if (existingThread) return existingThread.id;

  const { data: createdThread, error: createThreadError } = await adminSupabase
    .from("message_threads")
    .insert({
      parent_id: student.parent_id,
      tutor_id: tutorId,
      student_id: studentId,
      created_by: createdBy,
      tutor_last_read_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (createThreadError || !createdThread) {
    throw createThreadError ?? new Error("Unable to create the message thread.");
  }

  return createdThread.id;
}

export async function ensureMessageThreadForParent(adminSupabase: any, parentId: string, studentId: string, createdBy: string) {
  const { data: student, error: studentError } = await adminSupabase
    .from("students")
    .select("id, parent_id")
    .eq("id", studentId)
    .single();

  if (studentError || !student) {
    throw studentError ?? new Error("Student not found.");
  }

  if (student.parent_id !== parentId) {
    throw new Error("You can only message tutors linked to your child.");
  }

  const { data: assignment, error: assignmentError } = await adminSupabase
    .from("tutor_assignments")
    .select("tutor_id")
    .eq("student_id", studentId)
    .maybeSingle();

  if (assignmentError) throw assignmentError;
  if (!assignment?.tutor_id) {
    throw new Error("No tutor assignment exists for this student yet.");
  }

  const { data: existingThread, error: existingThreadError } = await adminSupabase
    .from("message_threads")
    .select("id")
    .eq("student_id", studentId)
    .eq("tutor_id", assignment.tutor_id)
    .eq("parent_id", parentId)
    .maybeSingle();

  if (existingThreadError) throw existingThreadError;
  if (existingThread) return existingThread.id;

  const { data: createdThread, error: createThreadError } = await adminSupabase
    .from("message_threads")
    .insert({
      parent_id: parentId,
      tutor_id: assignment.tutor_id,
      student_id: studentId,
      created_by: createdBy,
      parent_last_read_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (createThreadError || !createdThread) {
    throw createThreadError ?? new Error("Unable to create the message thread.");
  }

  return createdThread.id;
}

export async function markThreadRead(
  adminSupabase: any,
  viewerRole: ViewerRole,
  threadId: string,
) {
  const updateKey =
    viewerRole === "teacher" ? "tutor_last_read_at" : "parent_last_read_at";

  const { error } = await adminSupabase
    .from("message_threads")
    .update({ [updateKey]: new Date().toISOString() })
    .eq("id", threadId);

  if (error) throw error;
}

export async function hydrateThreads(
  adminSupabase: any,
  threads: ThreadRow[],
  viewerRole: ViewerRole,
) {
  const threadIds = threads.map((thread) => thread.id);
  const studentIds = Array.from(new Set(threads.map((thread) => thread.student_id)));
  const parentIds = Array.from(new Set(threads.map((thread) => thread.parent_id)));
  const tutorIds = Array.from(new Set(threads.map((thread) => thread.tutor_id)));

  const [messagesResult, studentsResult, parentsResult, tutorsResult, assignmentsResult] =
    await Promise.all([
      threadIds.length
        ? adminSupabase
            .from("messages")
            .select("id, thread_id, sender_user_id, sender_role, body, created_at")
            .in("thread_id", threadIds)
            .order("created_at", { ascending: true })
        : Promise.resolve({ data: [], error: null }),
      studentIds.length
        ? adminSupabase
            .from("students")
            .select("id, full_name, grade, curriculum")
            .in("id", studentIds)
        : Promise.resolve({ data: [], error: null }),
      parentIds.length
        ? adminSupabase
            .from("parents")
            .select("id, full_name, phone, user_id")
            .in("id", parentIds)
        : Promise.resolve({ data: [], error: null }),
      tutorIds.length
        ? adminSupabase
            .from("tutors")
            .select("id, full_name, phone, user_id")
            .in("id", tutorIds)
        : Promise.resolve({ data: [], error: null }),
      studentIds.length
        ? adminSupabase
            .from("tutor_assignments")
            .select("student_id, meeting_provider, meeting_link, start_date, session_day_of_week, session_start_time, session_end_time, session_frequency, session_timezone, session_end_date, reminder_enabled, reminder_offset_minutes")
            .in("student_id", studentIds)
        : Promise.resolve({ data: [], error: null }),
    ]);

  const firstError = [
    messagesResult.error,
    studentsResult.error,
    parentsResult.error,
    tutorsResult.error,
    assignmentsResult.error,
  ].find(Boolean);

  if (firstError) {
    throw firstError;
  }

  const studentMap = new Map((studentsResult.data ?? []).map((student: any) => [student.id, student] as const));
  const parentMap = new Map((parentsResult.data ?? []).map((parent: any) => [parent.id, parent] as const));
  const tutorMap = new Map((tutorsResult.data ?? []).map((tutor: any) => [tutor.id, tutor] as const));
  const assignmentMap = new Map(
    (assignmentsResult.data ?? []).map((assignment: any) => [assignment.student_id, assignment] as const),
  );

  const authDetails = new Map<string, Awaited<ReturnType<typeof getAuthUserDetails>>>();
  const profileUserIds = Array.from(
    new Set(
      (parentsResult.data ?? [])
        .map((parent: any) => parent.user_id)
        .concat((tutorsResult.data ?? []).map((tutor: any) => tutor.user_id))
        .filter(Boolean),
    ),
  ) as string[];

  await Promise.all(
    profileUserIds.map(async (userId) => {
      authDetails.set(userId, await getAuthUserDetails(adminSupabase, userId));
    }),
  );

  const messagesByThread = new Map<string, MessageRow[]>();

  for (const message of (messagesResult.data ?? []) as MessageRow[]) {
    const current = messagesByThread.get(message.thread_id) ?? [];
    current.push(message);
    messagesByThread.set(message.thread_id, current);
  }

  return threads.map((thread) => {
    const student = studentMap.get(thread.student_id);
    const parent = parentMap.get(thread.parent_id);
    const tutor = tutorMap.get(thread.tutor_id);
    const assignment = assignmentMap.get(thread.student_id);
    const parentAuth = parent?.user_id ? authDetails.get(parent.user_id) : null;
    const tutorAuth = tutor?.user_id ? authDetails.get(tutor.user_id) : null;
    const messages = messagesByThread.get(thread.id) ?? [];
    const lastReadAt =
      viewerRole === "teacher" ? thread.tutor_last_read_at : thread.parent_last_read_at;
    const unreadCount = messages.filter((message) => {
      if (message.sender_role === viewerRole) {
        return false;
      }

      if (!lastReadAt) {
        return true;
      }

      return message.created_at > lastReadAt;
    }).length;
    const lastMessage = messages[messages.length - 1] ?? null;

    return {
      id: thread.id,
      student: student
        ? {
            id: student.id,
            full_name: student.full_name,
            grade: student.grade,
            curriculum: student.curriculum,
          }
        : null,
      counterpart:
        viewerRole === "teacher"
          ? parent
            ? {
                full_name: parent.full_name,
                phone: parent.phone,
                email: parentAuth?.account_email ?? null,
              }
            : null
          : tutor
            ? {
                full_name: tutor.full_name,
                phone: tutor.phone,
                email: tutorAuth?.account_email ?? null,
              }
            : null,
      meeting: assignment
        ? {
            meeting_provider: assignment.meeting_provider ?? null,
            meeting_link: assignment.meeting_link ?? null,
            start_date: assignment.start_date ?? null,
            session_day_of_week: assignment.session_day_of_week ?? null,
            session_start_time: assignment.session_start_time ?? null,
            session_end_time: assignment.session_end_time ?? null,
            session_frequency: assignment.session_frequency ?? "weekly",
            session_timezone: assignment.session_timezone ?? "Africa/Nairobi",
            session_end_date: assignment.session_end_date ?? null,
            reminder_enabled: assignment.reminder_enabled ?? true,
            reminder_offset_minutes: assignment.reminder_offset_minutes ?? 60,
          }
        : null,
      unread_count: unreadCount,
      last_message_at: thread.last_message_at,
      last_message_preview: lastMessage?.body ?? "",
      messages,
    };
  });
}
