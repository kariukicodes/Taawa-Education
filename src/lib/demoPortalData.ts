import { DEMO_DATA } from "@/lib/demoData";

export function getDemoTeacherAssignedStudents() {
  return DEMO_DATA.teacher.students.map((student, index) => ({
    id: `demo-assignment-${student.id}`,
    student_id: student.id,
    full_name: student.full_name,
    age: student.age,
    grade: student.grade,
    curriculum: student.curriculum,
    status: "active",
    start_date: null,
    meeting_provider: index % 2 === 0 ? "google_meet" : "zoom",
    meeting_link:
      index % 2 === 0
        ? `https://meet.google.com/demo-${index + 1}`
        : `https://zoom.us/j/demo-${index + 1}`,
    session_day_of_week: index === 0 ? 1 : index === 1 ? 3 : 5,
    session_start_time: index % 2 === 0 ? "16:00:00" : "18:30:00",
    session_end_time: index % 2 === 0 ? "17:00:00" : "19:30:00",
    session_frequency: index % 2 === 0 ? "weekly" : "biweekly",
    session_timezone: "Africa/Nairobi",
    session_end_date: null,
    reminder_enabled: true,
    reminder_offset_minutes: 30,
    parent: {
      full_name: index % 2 === 0 ? "Amina Njeri" : "Brian Otieno",
      phone: index % 2 === 0 ? "+254700123456" : "+254711222333",
      email: index % 2 === 0 ? "amina@example.com" : "brian@example.com",
    },
  }));
}

export function getDemoParentChildren() {
  return DEMO_DATA.parent.students.map((student, index) => ({
    id: student.id,
    full_name: student.full_name,
    age: student.age,
    grade: student.grade,
    curriculum: student.curriculum,
    status: "active",
    start_date: student.start_date ?? null,
    meeting_provider: index % 2 === 0 ? "google_meet" : "zoom",
    meeting_link:
      index % 2 === 0
        ? `https://meet.google.com/family-demo-${index + 1}`
        : `https://zoom.us/j/family-demo-${index + 1}`,
    session_day_of_week: index === 0 ? 2 : 4,
    session_start_time: index === 0 ? "17:00:00" : "10:00:00",
    session_end_time: index === 0 ? "18:00:00" : "11:00:00",
    session_frequency: "weekly" as const,
    session_timezone: "Africa/Nairobi",
    session_end_date: null,
    reminder_enabled: true,
    reminder_offset_minutes: 60,
    tutor: {
      full_name: index === 0 ? "Ms. Achieng" : "Mr. Kibet",
      phone: index === 0 ? "+254722111222" : "+254733444555",
      email: index === 0 ? "achieng@taawa.test" : "kibet@taawa.test",
    },
  }));
}

export function getDemoTeacherThreads() {
  const students = getDemoTeacherAssignedStudents();

  return students.map((student, index) => ({
    id: `teacher-thread-${student.student_id}`,
    student: {
      id: student.student_id,
      full_name: student.full_name,
      grade: student.grade,
      curriculum: student.curriculum,
    },
    counterpart: student.parent,
    meeting: {
      meeting_provider: student.meeting_provider,
      meeting_link: student.meeting_link,
      start_date: student.start_date,
      session_day_of_week: student.session_day_of_week,
      session_start_time: student.session_start_time,
      session_end_time: student.session_end_time,
      session_frequency: student.session_frequency,
      session_timezone: student.session_timezone,
      session_end_date: student.session_end_date,
      reminder_enabled: Boolean(student.reminder_enabled),
      reminder_offset_minutes: student.reminder_offset_minutes ?? 30,
    },
    unread_count: index === 0 ? 1 : 0,
    last_message_at: new Date(Date.now() - index * 86_400_000).toISOString(),
    last_message_preview:
      index === 0
        ? "Thanks, teacher. Leah will be ready for today's session."
        : "Can we review the homework results next lesson?",
    messages: [
      {
        id: `teacher-msg-${student.student_id}-1`,
        body:
          index === 0
            ? "Hello! Just confirming today's online class for your child."
            : "Hi, I wanted to share a quick update from the last lesson.",
        created_at: new Date(Date.now() - (index + 2) * 86_400_000).toISOString(),
        sender_role: "teacher" as const,
      },
      {
        id: `teacher-msg-${student.student_id}-2`,
        body:
          index === 0
            ? "Thanks, teacher. Leah will be ready for today's session."
            : "Can we review the homework results next lesson?",
        created_at: new Date(Date.now() - index * 86_400_000).toISOString(),
        sender_role: "parent" as const,
      },
    ],
  }));
}

export function getDemoParentThreads() {
  const children = getDemoParentChildren();

  return children.map((child, index) => ({
    id: `parent-thread-${child.id}`,
    student: {
      id: child.id,
      full_name: child.full_name,
      grade: child.grade,
      curriculum: child.curriculum,
    },
    counterpart: child.tutor,
    meeting: {
      meeting_provider: child.meeting_provider,
      meeting_link: child.meeting_link,
      start_date: child.start_date,
      session_day_of_week: child.session_day_of_week,
      session_start_time: child.session_start_time,
      session_end_time: child.session_end_time,
      session_frequency: child.session_frequency,
      session_timezone: child.session_timezone,
      session_end_date: child.session_end_date,
      reminder_enabled: Boolean(child.reminder_enabled),
      reminder_offset_minutes: child.reminder_offset_minutes ?? 60,
    },
    unread_count: index === 1 ? 1 : 0,
    last_message_at: new Date(Date.now() - index * 43_200_000).toISOString(),
    last_message_preview:
      index === 1
        ? "Sam did well today. Please keep practicing reading aloud."
        : "Could we move next week's session by 30 minutes?",
    messages: [
      {
        id: `parent-msg-${child.id}-1`,
        body:
          index === 1
            ? "Sam did well today. Please keep practicing reading aloud."
            : "Could we move next week's session by 30 minutes?",
        created_at: new Date(Date.now() - (index + 1) * 43_200_000).toISOString(),
        sender_role: "teacher" as const,
      },
      {
        id: `parent-msg-${child.id}-2`,
        body:
          index === 1
            ? "Thank you. We'll continue the reading practice at home."
            : "That works well for us. Thank you!",
        created_at: new Date(Date.now() - index * 21_600_000).toISOString(),
        sender_role: "parent" as const,
      },
    ],
  }));
}
