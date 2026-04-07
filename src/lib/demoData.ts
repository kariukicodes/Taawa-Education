type AppRole = "admin" | "parent" | "teacher";

type DemoLead = {
  id: string;
  parent_name: string;
  email: string;
  status: string;
  created_at: string;
};

type DemoStudent = {
  id: string;
  full_name: string;
  age: number;
  grade: string;
  curriculum: string;
  subjects: string[];
  start_date?: string;
  tutor_assignments?: Array<{ tutors?: { full_name: string } }>;
};

type DemoLesson = {
  id: string;
  subject: string;
  date: string;
  topics_covered?: string;
  homework?: string | null;
  comments?: string | null;
  performance_rating?: string | null;
  students?: { full_name: string };
  tutors?: { full_name: string };
};

type DemoAttendance = {
  id: string;
  lesson_date: string;
  status: "present" | "absent" | "excused";
  students?: { full_name: string };
  tutors?: { full_name: string };
};

type DemoPayment = {
  id: string;
  description: string;
  amount_kes: number;
  date: string;
  status: "Paid" | "Pending" | "Overdue";
  students?: { full_name: string };
};

type DemoDocument = {
  id: string;
  file_name: string;
  file_url: string;
  created_at: string;
  students?: { full_name: string };
};

type DemoTask = {
  id: string;
  title: string;
  description?: string;
  due_date: string;
  status: "pending" | "done";
};

type DemoEarning = {
  id: string;
  description: string;
  amount_kes: number;
  date: string;
};

function isoDate(daysAgo = 0) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split("T")[0];
}

function isoDateTime(daysAgo = 0) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString();
}

export const DEMO_DATA: Record<AppRole, any> = {
  admin: {
    overview: {
      stats: {
        students: 24,
        tutors: 6,
        leads: 4,
        paymentsThisMonth: 128000,
      },
      recentLeads: [
        {
          id: "lead_1",
          parent_name: "Amina Njeri",
          email: "amina@example.com",
          status: "New",
          created_at: isoDateTime(1),
        },
        {
          id: "lead_2",
          parent_name: "Brian Otieno",
          email: "brian@example.com",
          status: "Contacted",
          created_at: isoDateTime(3),
        },
        {
          id: "lead_3",
          parent_name: "Cynthia Wambui",
          email: "cynthia@example.com",
          status: "Consultation Booked",
          created_at: isoDateTime(5),
        },
        {
          id: "lead_4",
          parent_name: "David Mwangi",
          email: "david@example.com",
          status: "Enrolled",
          created_at: isoDateTime(7),
        },
      ] satisfies DemoLead[],
    },

    leads: {
      leads: [
        {
          id: "lead_full_1",
          parent_name: "Amina Njeri",
          email: "amina@example.com",
          phone: "+254 700 123 456",
          child_name: "Leah Otieno",
          child_age: 10,
          grade: "Grade 4",
          curriculum_interest: "CBC",
          referral_source: "Instagram",
          message: "Looking for math and English tutoring twice a week.",
          status: "New",
          notes: "Call after 5pm.",
          follow_up_date: isoDate(1),
          created_at: isoDateTime(1),
        },
        {
          id: "lead_full_2",
          parent_name: "Brian Otieno",
          email: "brian@example.com",
          phone: "+254 711 222 333",
          child_name: "Noah Mwangi",
          child_age: 12,
          grade: "Grade 6",
          curriculum_interest: "British",
          referral_source: "Website",
          message: "Need ICT support and homework help.",
          status: "Contacted",
          notes: "Sent program brochure.",
          follow_up_date: isoDate(3),
          created_at: isoDateTime(3),
        },
        {
          id: "lead_full_3",
          parent_name: "Cynthia Wambui",
          email: "cynthia@example.com",
          phone: "+254 733 444 555",
          child_name: "Zuri Wambui",
          child_age: 8,
          grade: "Grade 2",
          curriculum_interest: "Montessori",
          referral_source: "Referral",
          message: "Reading and math confidence building.",
          status: "Consultation Booked",
          notes: "Consultation scheduled.",
          follow_up_date: isoDate(5),
          created_at: isoDateTime(5),
        },
        {
          id: "lead_full_4",
          parent_name: "David Mwangi",
          email: "david@example.com",
          phone: "+254 722 999 888",
          child_name: "Sam Otieno",
          child_age: 6,
          grade: "Grade 1",
          curriculum_interest: "CBC",
          referral_source: "Facebook",
          message: "Early reading support.",
          status: "Enrolled",
          notes: "Converted to enrolled.",
          follow_up_date: null,
          created_at: isoDateTime(7),
        },
      ],
    },

    payments: {
      payments: [
        {
          id: "ap_1",
          description: "Tuition (April)",
          amount_kes: 12000,
          date: isoDate(6),
          status: "Paid",
          students: { full_name: "Leah Otieno" },
        },
        {
          id: "ap_2",
          description: "Assessment fee",
          amount_kes: 2500,
          date: isoDate(18),
          status: "Pending",
          students: { full_name: "Zuri Wambui" },
        },
        {
          id: "ap_3",
          description: "Tuition (March)",
          amount_kes: 12000,
          date: isoDate(40),
          status: "Overdue",
          students: { full_name: "Noah Mwangi" },
        },
      ] satisfies DemoPayment[],
      earnings: [
        {
          id: "ae_1",
          description: "Lesson session",
          amount_kes: 1800,
          date: isoDate(5),
          tutors: { full_name: "Mr. Kibet" },
        },
        {
          id: "ae_2",
          description: "Lesson session",
          amount_kes: 2000,
          date: isoDate(12),
          tutors: { full_name: "Ms. Achieng" },
        },
      ],
    },

    announcements: {
      announcements: [
        {
          id: "ann_1",
          message: "Reminder: Submit weekly progress updates by Friday 5pm.",
          target_role: "teacher",
          created_at: isoDateTime(2),
        },
        {
          id: "ann_2",
          message: "Parents: April invoices are now available in Billing.",
          target_role: "parent",
          created_at: isoDateTime(4),
        },
        {
          id: "ann_3",
          message: "Welcome! New students start next Monday.",
          target_role: "all",
          created_at: isoDateTime(10),
        },
      ],
    },

    tasks: {
      tasks: [
        {
          id: "at_1",
          tutor_id: "t_1",
          title: "Prepare weekly lesson plan",
          description: "Submit plan for next week",
          due_date: isoDate(2),
          status: "pending",
          tutors: { full_name: "Mr. Kibet" },
        },
        {
          id: "at_2",
          tutor_id: "t_2",
          title: "Mark assessments",
          description: "Grade reading assessments",
          due_date: isoDate(5),
          status: "pending",
          tutors: { full_name: "Ms. Achieng" },
        },
        {
          id: "at_3",
          tutor_id: "t_3",
          title: "Parent feedback calls",
          description: "Call 3 parents for progress updates",
          due_date: isoDate(7),
          status: "done",
          tutors: { full_name: "Mr. Kamau" },
        },
      ],
    },

    assignments: {
      assignments: [
        {
          id: "as_1",
          tutor_id: "t_2",
          start_date: isoDate(60),
          tutors: { full_name: "Ms. Achieng" },
          students: { full_name: "Leah Otieno", grade: "Grade 4", subjects: ["Math", "English", "Science"] },
        },
        {
          id: "as_2",
          tutor_id: "t_3",
          start_date: isoDate(30),
          tutors: { full_name: "Mr. Kamau" },
          students: { full_name: "Noah Mwangi", grade: "Grade 6", subjects: ["Math", "ICT", "English"] },
        },
      ],
    },

    reports: {
      lessons: [
        {
          id: "ar_1",
          subject: "Math",
          date: isoDate(2),
          topics_covered: "Fractions, simplification, word problems",
          homework: "Complete worksheet 3A",
          performance_rating: "Good",
          comments: "Good grasp; needs more speed with mixed numbers.",
          students: { full_name: "Leah Otieno" },
          tutors: { full_name: "Ms. Achieng" },
        },
        {
          id: "ar_2",
          subject: "ICT",
          date: isoDate(5),
          topics_covered: "Typing practice, basic spreadsheets",
          homework: null,
          performance_rating: "Excellent",
          comments: "Great focus and accuracy today.",
          students: { full_name: "Noah Mwangi" },
          tutors: { full_name: "Mr. Kamau" },
        },
      ] satisfies DemoLesson[],
    },
    students: {
      parents: [
        { id: "p_1", full_name: "Amina Njeri" },
        { id: "p_2", full_name: "Brian Otieno" },
        { id: "p_3", full_name: "Cynthia Wambui" },
      ],
      tutors: [
        { id: "t_1", full_name: "Mr. Kibet" },
        { id: "t_2", full_name: "Ms. Achieng" },
        { id: "t_3", full_name: "Mr. Kamau" },
      ],
      students: [
        {
          id: "s_1",
          full_name: "Leah Otieno",
          age: 10,
          grade: "Grade 4",
          curriculum: "CBC",
          subjects: ["Math", "English", "Science"],
          start_date: isoDate(60),
          tutor_assignments: [{ tutors: { full_name: "Ms. Achieng" } }],
        },
        {
          id: "s_2",
          full_name: "Noah Mwangi",
          age: 12,
          grade: "Grade 6",
          curriculum: "British",
          subjects: ["Math", "ICT", "English"],
          start_date: isoDate(30),
          tutor_assignments: [{ tutors: { full_name: "Mr. Kamau" } }],
        },
        {
          id: "s_3",
          full_name: "Zuri Wambui",
          age: 8,
          grade: "Grade 2",
          curriculum: "Montessori",
          subjects: ["Reading", "Math"],
          start_date: isoDate(14),
          tutor_assignments: [],
        },
      ] satisfies DemoStudent[],
    },
    parents: {
      parents: [
        {
          id: "parent_row_1",
          full_name: "Amina Njeri",
          phone: "+254 700 123 456",
          students: [
            { full_name: "Leah Otieno", grade: "Grade 4" },
            { full_name: "Sam Otieno", grade: "Grade 1" },
          ],
        },
        {
          id: "parent_row_2",
          full_name: "Brian Otieno",
          phone: "+254 711 222 333",
          students: [{ full_name: "Noah Mwangi", grade: "Grade 6" }],
        },
      ],
    },
    tutors: {
      tutors: [
        {
          id: "tutor_row_1",
          full_name: "Mr. Kibet",
          status: "active",
          rate_kes: 1800,
          subjects: ["Math", "Science"],
          tutor_assignments: [{ student_id: "s_1" }, { student_id: "s_2" }],
        },
        {
          id: "tutor_row_2",
          full_name: "Ms. Achieng",
          status: "active",
          rate_kes: 2000,
          subjects: ["English", "Kiswahili"],
          tutor_assignments: [{ student_id: "s_3" }],
        },
        {
          id: "tutor_row_3",
          full_name: "Mr. Kamau",
          status: "inactive",
          rate_kes: 1500,
          subjects: ["ICT", "Math"],
          tutor_assignments: [],
        },
      ],
    },
  },

  parent: {
    profile: {
      firstName: "Amina",
    },
    students: [
      {
        id: "ps_1",
        full_name: "Leah Otieno",
        age: 10,
        grade: "Grade 4",
        curriculum: "CBC",
        subjects: ["Math", "English", "Science"],
        start_date: isoDate(60),
        tutor_assignments: [{ tutors: { full_name: "Ms. Achieng" } }],
      },
      {
        id: "ps_2",
        full_name: "Sam Otieno",
        age: 6,
        grade: "Grade 1",
        curriculum: "CBC",
        subjects: ["Reading", "Math"],
        start_date: isoDate(30),
        tutor_assignments: [{ tutors: { full_name: "Mr. Kibet" } }],
      },
    ] satisfies DemoStudent[],
    overview: {
      stats: {
        lessonsThisWeek: 5,
        attendanceRate: 92,
        latestRating: "Good",
        pendingPayments: 14500,
      },
      recentLessons: [
        {
          id: "pl_1",
          subject: "Math",
          date: isoDate(2),
          performance_rating: "Good",
          comments: "Solid progress on fractions; keep practicing word problems.",
          students: { full_name: "Leah Otieno" },
          tutors: { full_name: "Ms. Achieng" },
        },
        {
          id: "pl_2",
          subject: "Reading",
          date: isoDate(4),
          performance_rating: "Excellent",
          comments: "Great fluency and comprehension today.",
          students: { full_name: "Sam Otieno" },
          tutors: { full_name: "Mr. Kibet" },
        },
        {
          id: "pl_3",
          subject: "Science",
          date: isoDate(6),
          performance_rating: "Good",
          comments: "Understands the water cycle; revise key terms.",
          students: { full_name: "Leah Otieno" },
          tutors: { full_name: "Ms. Achieng" },
        },
      ] satisfies DemoLesson[],
    },
    attendance: {
      records: [
        {
          id: "pa_1",
          lesson_date: isoDate(1),
          status: "present",
          students: { full_name: "Leah Otieno" },
          tutors: { full_name: "Ms. Achieng" },
        },
        {
          id: "pa_2",
          lesson_date: isoDate(3),
          status: "present",
          students: { full_name: "Sam Otieno" },
          tutors: { full_name: "Mr. Kibet" },
        },
        {
          id: "pa_3",
          lesson_date: isoDate(8),
          status: "excused",
          students: { full_name: "Leah Otieno" },
          tutors: { full_name: "Ms. Achieng" },
        },
      ] satisfies DemoAttendance[],
    },
    billing: {
      payments: [
        {
          id: "pay_1",
          description: "Tuition (April)",
          amount_kes: 12000,
          date: isoDate(10),
          status: "Pending",
          students: { full_name: "Leah Otieno" },
        },
        {
          id: "pay_2",
          description: "Assessment fee",
          amount_kes: 2500,
          date: isoDate(18),
          status: "Overdue",
          students: { full_name: "Sam Otieno" },
        },
        {
          id: "pay_3",
          description: "Tuition (March)",
          amount_kes: 12000,
          date: isoDate(40),
          status: "Paid",
          students: { full_name: "Leah Otieno" },
        },
      ] satisfies DemoPayment[],
    },
    documents: {
      docs: [
        {
          id: "doc_1",
          file_name: "Term 1 Report Card.pdf",
          file_url: "#",
          created_at: isoDateTime(12),
          students: { full_name: "Leah Otieno" },
        },
        {
          id: "doc_2",
          file_name: "Reading Assessment.pdf",
          file_url: "#",
          created_at: isoDateTime(25),
          students: { full_name: "Sam Otieno" },
        },
      ] satisfies DemoDocument[],
    },
    reports: {
      lessons: [
        {
          id: "pr_1",
          subject: "Math",
          date: isoDate(2),
          topics_covered: "Fractions, simplification, word problems",
          homework: "Complete worksheet 3A",
          performance_rating: "Good",
          comments: "Good grasp; needs more speed with mixed numbers.",
          students: { full_name: "Leah Otieno" },
          tutors: { full_name: "Ms. Achieng" },
        },
        {
          id: "pr_2",
          subject: "Reading",
          date: isoDate(4),
          topics_covered: "Sight words and comprehension",
          homework: null,
          performance_rating: "Excellent",
          comments: "Excellent confidence reading aloud.",
          students: { full_name: "Sam Otieno" },
          tutors: { full_name: "Mr. Kibet" },
        },
      ] satisfies DemoLesson[],
    },
  },

  teacher: {
    students: [
      {
        id: "ts_1",
        full_name: "Leah Otieno",
        age: 10,
        grade: "Grade 4",
        curriculum: "CBC",
        subjects: ["Math", "Science"],
      },
      {
        id: "ts_2",
        full_name: "Noah Mwangi",
        age: 12,
        grade: "Grade 6",
        curriculum: "British",
        subjects: ["Math", "ICT"],
      },
      {
        id: "ts_3",
        full_name: "Zuri Wambui",
        age: 8,
        grade: "Grade 2",
        curriculum: "Montessori",
        subjects: ["Reading", "Math"],
      },
    ],
    lessons: {
      lessons: [
        {
          id: "tl_1",
          subject: "Math",
          date: isoDate(1),
          topics_covered: "Long division",
          performance_rating: "Good",
          students: { full_name: "Noah Mwangi" },
        },
        {
          id: "tl_2",
          subject: "Science",
          date: isoDate(3),
          topics_covered: "States of matter",
          performance_rating: "Excellent",
          students: { full_name: "Leah Otieno" },
        },
      ] satisfies DemoLesson[],
    },
    tasks: {
      tasks: [
        {
          id: "task_1",
          title: "Prepare weekly lesson plan",
          description: "Submit plan for next week",
          due_date: isoDate(2),
          status: "pending",
        },
        {
          id: "task_2",
          title: "Mark assessments",
          description: "Grade reading assessments",
          due_date: isoDate(5),
          status: "pending",
        },
        {
          id: "task_3",
          title: "Parent feedback calls",
          description: "Call 3 parents for progress updates",
          due_date: isoDate(7),
          status: "done",
        },
      ] satisfies DemoTask[],
    },
    earnings: {
      earnings: [
        {
          id: "earn_1",
          description: "Lesson session",
          amount_kes: 1800,
          date: isoDate(3),
        },
        {
          id: "earn_2",
          description: "Lesson session",
          amount_kes: 1800,
          date: isoDate(10),
        },
        {
          id: "earn_3",
          description: "Lesson session",
          amount_kes: 2000,
          date: isoDate(18),
        },
      ] satisfies DemoEarning[],
    },
    attendance: {
      records: [
        {
          id: "ta_1",
          lesson_date: isoDate(1),
          status: "present",
          students: { full_name: "Noah Mwangi" },
        },
        {
          id: "ta_2",
          lesson_date: isoDate(3),
          status: "present",
          students: { full_name: "Leah Otieno" },
        },
        {
          id: "ta_3",
          lesson_date: isoDate(8),
          status: "absent",
          students: { full_name: "Zuri Wambui" },
        },
      ] satisfies DemoAttendance[],
    },
  },
};
