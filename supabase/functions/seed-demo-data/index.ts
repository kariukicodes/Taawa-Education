import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  try {
    // Create auth users
    const users = [
      { email: "admin@taawa.co.ke", password: "Admin123!", role: "admin" as const },
      { email: "grace.kamau@gmail.com", password: "Parent123!", role: "parent" as const },
      { email: "david.omondi@gmail.com", password: "Parent123!", role: "parent" as const },
      { email: "tutor.amina@taawa.co.ke", password: "Tutor123!", role: "teacher" as const },
      { email: "tutor.brian@taawa.co.ke", password: "Tutor123!", role: "teacher" as const },
    ];

    const createdUsers: Record<string, string> = {};

    for (const u of users) {
      // Check if user exists
      const { data: existingUsers } = await supabase.auth.admin.listUsers();
      const existing = existingUsers?.users?.find((eu) => eu.email === u.email);
      
      if (existing) {
        createdUsers[u.email] = existing.id;
      } else {
        const { data, error } = await supabase.auth.admin.createUser({
          email: u.email,
          password: u.password,
          email_confirm: true,
        });
        if (error) throw new Error(`Failed to create user ${u.email}: ${error.message}`);
        createdUsers[u.email] = data.user.id;
      }
    }

    // Assign roles
    for (const u of users) {
      await supabase.from("user_roles").upsert(
        { user_id: createdUsers[u.email], role: u.role },
        { onConflict: "user_id,role" }
      );
    }

    // Create parents
    const { data: parent1 } = await supabase.from("parents").upsert(
      { user_id: createdUsers["grace.kamau@gmail.com"], full_name: "Grace Kamau", phone: "+254 712 345 678" },
      { onConflict: "user_id" }
    ).select().single();

    const { data: parent2 } = await supabase.from("parents").upsert(
      { user_id: createdUsers["david.omondi@gmail.com"], full_name: "David Omondi", phone: "+254 723 456 789" },
      { onConflict: "user_id" }
    ).select().single();

    // Create tutors
    const { data: tutor1 } = await supabase.from("tutors").upsert(
      { user_id: createdUsers["tutor.amina@taawa.co.ke"], full_name: "Amina Hassan", phone: "+254 734 567 890", subjects: ["Math", "Science", "English", "History"], rate_kes: 45000, status: "active" },
      { onConflict: "user_id" }
    ).select().single();

    const { data: tutor2 } = await supabase.from("tutors").upsert(
      { user_id: createdUsers["tutor.brian@taawa.co.ke"], full_name: "Brian Kipchoge", phone: "+254 745 678 901", subjects: ["Math", "English"], rate_kes: 35000, status: "active" },
      { onConflict: "user_id" }
    ).select().single();

    // Create students
    // First delete existing to avoid duplicates
    await supabase.from("tutor_assignments").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    await supabase.from("lessons").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    await supabase.from("attendance").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    await supabase.from("payments").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    await supabase.from("documents").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    await supabase.from("students").delete().neq("id", "00000000-0000-0000-0000-000000000000");

    const { data: zara } = await supabase.from("students").insert(
      { parent_id: parent1!.id, full_name: "Zara Kamau", age: 10, grade: "5", curriculum: "CBC", subjects: ["Math", "English", "Science"], start_date: "2025-01-15" }
    ).select().single();

    const { data: leo } = await supabase.from("students").insert(
      { parent_id: parent1!.id, full_name: "Leo Kamau", age: 8, grade: "3", curriculum: "CBC", subjects: ["Math", "English"], start_date: "2025-03-01" }
    ).select().single();

    const { data: ethan } = await supabase.from("students").insert(
      { parent_id: parent2!.id, full_name: "Ethan Omondi", age: 13, grade: "8", curriculum: "British", subjects: ["Math", "English", "History", "Science"], start_date: "2025-02-01" }
    ).select().single();

    // Tutor assignments
    await supabase.from("tutor_assignments").insert([
      { tutor_id: tutor1!.id, student_id: zara!.id, assigned_by: createdUsers["admin@taawa.co.ke"] },
      { tutor_id: tutor2!.id, student_id: leo!.id, assigned_by: createdUsers["admin@taawa.co.ke"] },
      { tutor_id: tutor1!.id, student_id: ethan!.id, assigned_by: createdUsers["admin@taawa.co.ke"] },
    ]);

    // Leads
    await supabase.from("leads").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    await supabase.from("leads").insert([
      { parent_name: "Wanjiku Mwangi", email: "wanjiku@gmail.com", phone: "+254 711 222 333", child_name: "Aisha", child_age: 7, grade: "2", curriculum_interest: "CBC", referral_source: "Referral", message: "Looking for personalized homeschooling for my daughter who needs extra attention in reading and comprehension.", status: "New" },
      { parent_name: "James Otieno", email: "james.otieno@yahoo.com", phone: "+254 722 333 444", child_name: "Ryan", child_age: 11, grade: "6", curriculum_interest: "British", referral_source: "Google", message: "We are relocating from the UK and want to continue the British curriculum at home for our son.", status: "New" },
      { parent_name: "Fatima Ali", email: "fatima.ali@hotmail.com", phone: "+254 733 444 555", child_name: "Halima", child_age: 5, grade: "PP2", curriculum_interest: "Montessori", referral_source: "Instagram", message: "Interested in the Montessori approach for early years. Would love to understand session structure.", status: "Contacted", notes: "Called on 15th March. Very interested. Scheduled follow-up." },
      { parent_name: "Peter Njoroge", email: "peter.njoroge@gmail.com", phone: "+254 744 555 666", child_name: "Imani", child_age: 9, grade: "4", curriculum_interest: "CBC", referral_source: "School", message: "Our daughter has been struggling in a large classroom and we believe homeschooling is the answer.", status: "Consultation Booked", notes: "Consultation scheduled for 25th March at 10am.", follow_up_date: "2026-03-25" },
      { parent_name: "Lucy Wambui", email: "lucy.wambui@gmail.com", phone: "+254 755 666 777", child_name: "Jabari", child_age: 14, grade: "9", curriculum_interest: "British", referral_source: "Referral", message: "Want to prepare my son for IGCSEs in a structured home environment. Currently in a Nairobi school.", status: "Enrolled", notes: "Enrolled in March. Assigned to Amina." },
    ]);

    // Lessons (last 3 weeks)
    const today = new Date();
    const daysAgo = (n: number) => {
      const d = new Date(today);
      d.setDate(d.getDate() - n);
      return d.toISOString().split("T")[0];
    };

    await supabase.from("lessons").insert([
      { tutor_id: tutor1!.id, student_id: zara!.id, subject: "Math", date: daysAgo(2), topics_covered: "Fractions and decimals conversion", homework: "Complete exercises 4.1 - 4.5 in the workbook", comments: "Zara showed excellent understanding of fraction-to-decimal conversion.", performance_rating: "Excellent" },
      { tutor_id: tutor1!.id, student_id: zara!.id, subject: "Science", date: daysAgo(5), topics_covered: "The water cycle and weather patterns", homework: "Draw and label the water cycle diagram", comments: "Very engaged during the experiment demonstration.", performance_rating: "Excellent" },
      { tutor_id: tutor1!.id, student_id: zara!.id, subject: "English", date: daysAgo(9), topics_covered: "Creative writing — narrative structure", homework: "Write a 300-word short story using the narrative arc", comments: "Good vocabulary but needs to work on paragraph transitions.", performance_rating: "Good" },
      { tutor_id: tutor2!.id, student_id: leo!.id, subject: "Math", date: daysAgo(1), topics_covered: "Multiplication tables (6, 7, 8)", homework: "Practice multiplication flash cards 15 minutes daily", comments: "Leo is making steady progress. Struggled a bit with 7x and 8x tables.", performance_rating: "Good" },
      { tutor_id: tutor2!.id, student_id: leo!.id, subject: "English", date: daysAgo(4), topics_covered: "Reading comprehension — identifying main ideas", homework: "Read Chapter 3 and answer comprehension questions", comments: "Needs more practice identifying supporting details.", performance_rating: "Needs Improvement" },
      { tutor_id: tutor1!.id, student_id: ethan!.id, subject: "Math", date: daysAgo(3), topics_covered: "Algebraic expressions and simplification", homework: "Complete algebra worksheet pages 12-14", comments: "Ethan grasped the concept quickly. Ready to move to equations.", performance_rating: "Excellent" },
      { tutor_id: tutor1!.id, student_id: ethan!.id, subject: "History", date: daysAgo(7), topics_covered: "World War I — causes and alliances", homework: "Write a 500-word essay on the Treaty of Versailles", comments: "Excellent analytical thinking. Essay writing improving.", performance_rating: "Excellent" },
      { tutor_id: tutor1!.id, student_id: ethan!.id, subject: "Science", date: daysAgo(10), topics_covered: "Chemical reactions and balancing equations", homework: "Balance 10 chemical equations from the worksheet", comments: "Found balancing equations challenging. Will revisit next session.", performance_rating: "Good" },
    ]);

    // Attendance
    await supabase.from("attendance").insert([
      { student_id: zara!.id, tutor_id: tutor1!.id, lesson_date: daysAgo(2), status: "present" },
      { student_id: zara!.id, tutor_id: tutor1!.id, lesson_date: daysAgo(5), status: "present" },
      { student_id: zara!.id, tutor_id: tutor1!.id, lesson_date: daysAgo(9), status: "present" },
      { student_id: leo!.id, tutor_id: tutor2!.id, lesson_date: daysAgo(1), status: "present" },
      { student_id: leo!.id, tutor_id: tutor2!.id, lesson_date: daysAgo(4), status: "absent" },
      { student_id: leo!.id, tutor_id: tutor2!.id, lesson_date: daysAgo(8), status: "present" },
      { student_id: ethan!.id, tutor_id: tutor1!.id, lesson_date: daysAgo(3), status: "present" },
      { student_id: ethan!.id, tutor_id: tutor1!.id, lesson_date: daysAgo(7), status: "present" },
      { student_id: ethan!.id, tutor_id: tutor1!.id, lesson_date: daysAgo(10), status: "absent" },
      { student_id: ethan!.id, tutor_id: tutor1!.id, lesson_date: daysAgo(14), status: "excused" },
    ]);

    // Tasks
    await supabase.from("tasks").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    await supabase.from("tasks").insert([
      { tutor_id: tutor1!.id, title: "Submit March progress report", description: "Complete and submit the monthly progress report for all assigned students.", due_date: daysAgo(-5), status: "pending" },
      { tutor_id: tutor1!.id, title: "Review student assessment rubric", description: "Review and update the assessment rubric for the upcoming term evaluations.", due_date: daysAgo(-10), status: "pending" },
      { tutor_id: tutor1!.id, title: "Update weekly timetable", description: "Adjust the timetable to accommodate the new Science lab schedule.", due_date: daysAgo(3), status: "done" },
      { tutor_id: tutor2!.id, title: "Submit March progress report", description: "Complete and submit the monthly progress report for Leo Kamau.", due_date: daysAgo(-5), status: "pending" },
      { tutor_id: tutor2!.id, title: "Prepare reading list for Term 2", description: "Curate a reading list aligned with CBC Grade 3 English requirements.", due_date: daysAgo(-8), status: "pending" },
      { tutor_id: tutor2!.id, title: "Complete safeguarding training", description: "Finish the online child safeguarding certification module.", due_date: daysAgo(7), status: "done" },
    ]);

    // Payments
    await supabase.from("payments").insert([
      { student_id: zara!.id, description: "January 2026 tuition", amount_kes: 25000, date: "2026-01-15", status: "Paid" },
      { student_id: zara!.id, description: "February 2026 tuition", amount_kes: 25000, date: "2026-02-15", status: "Paid" },
      { student_id: zara!.id, description: "March 2026 tuition", amount_kes: 25000, date: "2026-03-15", status: "Pending" },
      { student_id: leo!.id, description: "January 2026 tuition", amount_kes: 18000, date: "2026-01-15", status: "Paid" },
      { student_id: leo!.id, description: "February 2026 tuition", amount_kes: 18000, date: "2026-02-15", status: "Paid" },
      { student_id: leo!.id, description: "March 2026 tuition", amount_kes: 18000, date: "2026-03-15", status: "Overdue" },
      { student_id: ethan!.id, description: "January 2026 tuition", amount_kes: 22000, date: "2026-01-15", status: "Paid" },
      { student_id: ethan!.id, description: "February 2026 tuition", amount_kes: 22000, date: "2026-02-15", status: "Paid" },
      { student_id: ethan!.id, description: "March 2026 tuition", amount_kes: 22000, date: "2026-03-15", status: "Pending" },
    ]);

    // Earnings
    await supabase.from("earnings").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    await supabase.from("earnings").insert([
      { tutor_id: tutor1!.id, description: "February 2026 salary", amount_kes: 45000, date: "2026-02-28" },
      { tutor_id: tutor1!.id, description: "March 2026 salary", amount_kes: 45000, date: "2026-03-31" },
      { tutor_id: tutor1!.id, description: "January 2026 salary", amount_kes: 45000, date: "2026-01-31" },
      { tutor_id: tutor2!.id, description: "February 2026 salary", amount_kes: 35000, date: "2026-02-28" },
      { tutor_id: tutor2!.id, description: "March 2026 salary", amount_kes: 35000, date: "2026-03-31" },
      { tutor_id: tutor2!.id, description: "January 2026 salary", amount_kes: 35000, date: "2026-01-31" },
    ]);

    // Announcements
    await supabase.from("announcements").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    await supabase.from("announcements").insert([
      { message: "Dear Parents, we are pleased to announce that Term 2 begins on 14th April. Please ensure all outstanding payments are settled before the start of the new term. Timetables will be shared by 10th April. Thank you for your continued trust in Taawa Education.", target_role: "parent" },
      { message: "Hi Team, please ensure all March progress reports are submitted by 5th April. The new assessment rubric templates have been uploaded to the shared folder. Reach out if you have any questions.", target_role: "teacher" },
    ]);

    // Documents
    await supabase.from("documents").insert([
      { student_id: zara!.id, file_name: "Zara_Kamau_Term1_Report.pdf", file_url: "https://placeholder.taawa.co.ke/reports/zara-term1.pdf", uploaded_by: createdUsers["admin@taawa.co.ke"] },
      { student_id: zara!.id, file_name: "Zara_Kamau_Math_Assessment.pdf", file_url: "https://placeholder.taawa.co.ke/assessments/zara-math.pdf", uploaded_by: createdUsers["tutor.amina@taawa.co.ke"] },
      { student_id: leo!.id, file_name: "Leo_Kamau_Term1_Report.pdf", file_url: "https://placeholder.taawa.co.ke/reports/leo-term1.pdf", uploaded_by: createdUsers["admin@taawa.co.ke"] },
      { student_id: leo!.id, file_name: "Leo_Kamau_English_Assessment.pdf", file_url: "https://placeholder.taawa.co.ke/assessments/leo-english.pdf", uploaded_by: createdUsers["tutor.brian@taawa.co.ke"] },
      { student_id: ethan!.id, file_name: "Ethan_Omondi_Term1_Report.pdf", file_url: "https://placeholder.taawa.co.ke/reports/ethan-term1.pdf", uploaded_by: createdUsers["admin@taawa.co.ke"] },
      { student_id: ethan!.id, file_name: "Ethan_Omondi_Science_Assessment.pdf", file_url: "https://placeholder.taawa.co.ke/assessments/ethan-science.pdf", uploaded_by: createdUsers["tutor.amina@taawa.co.ke"] },
    ]);

    return new Response(JSON.stringify({ success: true, users: Object.keys(createdUsers) }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
