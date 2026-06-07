export const PARENT_FULL_SELECT =
  "id, full_name, phone, user_id, status, archived_at, created_at";
export const PARENT_BASIC_SELECT =
  "id, full_name, phone, user_id, created_at";

export const STUDENT_FULL_SELECT =
  "id, parent_id, full_name, age, grade, curriculum, start_date, status, archived_at, created_at";
export const STUDENT_BASIC_SELECT =
  "id, parent_id, full_name, age, grade, curriculum, created_at";

export const TUTOR_FULL_SELECT =
  "id, full_name, phone, rate_kes, status, subjects, user_id, created_at";
export const TUTOR_BASIC_SELECT =
  "id, full_name, phone, user_id, created_at";

export const ASSIGNMENT_FULL_SELECT =
  "id, tutor_id, student_id, start_date, meeting_provider, meeting_link, created_at, session_day_of_week, session_start_time, session_end_time, session_frequency, session_timezone, session_end_date, reminder_enabled, reminder_offset_minutes, external_meeting_id";
export const ASSIGNMENT_BASIC_SELECT =
  "id, tutor_id, student_id, created_at";

type QueryResult<T> = Promise<{
  data: T;
  error: { message?: string } | null;
}>;

type CompatResult<T> = {
  data: T;
  error: { message?: string } | null;
  usedFallback: boolean;
};

function normalizeArrayOrValue<TInput, TOutput>(
  value: TInput[] | TInput | null,
  normalize: (item: TInput) => TOutput,
): TOutput[] | TOutput | null {
  if (Array.isArray(value)) {
    return value.map(normalize);
  }

  if (!value) {
    return value;
  }

  return normalize(value);
}

export function isMissingColumnError(error: { message?: string } | null | undefined) {
  return Boolean(error?.message?.toLowerCase().includes("does not exist"));
}

export async function selectWithFallback<TInput, TOutput>(
  fullQuery: () => QueryResult<TInput[] | TInput | null>,
  basicQuery: () => QueryResult<TInput[] | TInput | null>,
  normalize: (item: TInput) => TOutput,
): Promise<CompatResult<TOutput[] | TOutput | null>> {
  const fullResult = await fullQuery();

  if (!fullResult.error) {
    return {
      data: normalizeArrayOrValue(fullResult.data, normalize),
      error: null,
      usedFallback: false,
    };
  }

  if (!isMissingColumnError(fullResult.error)) {
    return {
      data: null,
      error: fullResult.error,
      usedFallback: false,
    };
  }

  const basicResult = await basicQuery();

  if (basicResult.error) {
    return {
      data: null,
      error: basicResult.error,
      usedFallback: true,
    };
  }

  return {
    data: normalizeArrayOrValue(basicResult.data, normalize),
    error: null,
    usedFallback: true,
  };
}

export function normalizeParent(parent: Record<string, unknown>) {
  return {
    ...parent,
    phone: parent.phone ?? null,
    user_id: parent.user_id ?? null,
    status: parent.status ?? "active",
    archived_at: parent.archived_at ?? null,
    created_at: parent.created_at ?? null,
  };
}

export function normalizeStudent(student: Record<string, unknown>) {
  return {
    ...student,
    age: student.age ?? null,
    grade: student.grade ?? null,
    curriculum: student.curriculum ?? null,
    subjects: Array.isArray(student.subjects) ? student.subjects : [],
    start_date: student.start_date ?? null,
    status: student.status ?? "active",
    archived_at: student.archived_at ?? null,
    created_at: student.created_at ?? null,
  };
}

export function normalizeTutor(tutor: Record<string, unknown>) {
  return {
    ...tutor,
    phone: tutor.phone ?? null,
    rate_kes: typeof tutor.rate_kes === "number" ? tutor.rate_kes : 0,
    status: tutor.status ?? "active",
    subjects: Array.isArray(tutor.subjects) ? tutor.subjects : [],
    user_id: tutor.user_id ?? null,
    created_at: tutor.created_at ?? null,
  };
}

export function normalizeAssignment(assignment: Record<string, unknown>) {
  return {
    ...assignment,
    start_date: assignment.start_date ?? null,
    meeting_provider: assignment.meeting_provider ?? null,
    meeting_link: assignment.meeting_link ?? null,
    session_day_of_week: assignment.session_day_of_week ?? null,
    session_start_time: assignment.session_start_time ?? null,
    session_end_time: assignment.session_end_time ?? null,
    session_frequency: assignment.session_frequency ?? "weekly",
    session_timezone: assignment.session_timezone ?? "Africa/Nairobi",
    session_end_date: assignment.session_end_date ?? null,
    reminder_enabled:
      typeof assignment.reminder_enabled === "boolean"
        ? assignment.reminder_enabled
        : true,
    reminder_offset_minutes:
      typeof assignment.reminder_offset_minutes === "number"
        ? assignment.reminder_offset_minutes
        : 60,
    external_meeting_id: assignment.external_meeting_id ?? null,
    created_at: assignment.created_at ?? null,
  };
}
