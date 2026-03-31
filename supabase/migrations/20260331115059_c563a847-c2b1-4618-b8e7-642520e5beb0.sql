
-- Role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'parent', 'teacher');

-- User roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role) $$;

CREATE POLICY "Users can read own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Parents
CREATE TABLE public.parents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT NOT NULL, phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.parents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Parents can read own" ON public.parents FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage parents" ON public.parents FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Tutors
CREATE TABLE public.tutors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT NOT NULL, phone TEXT,
  subjects TEXT[] DEFAULT '{}', rate_kes INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.tutors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tutors can read own" ON public.tutors FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage tutors" ON public.tutors FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Parents can view tutors" ON public.tutors FOR SELECT USING (public.has_role(auth.uid(), 'parent'));

-- Students (without tutor assignment RLS - added later)
CREATE TABLE public.students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID REFERENCES public.parents(id) ON DELETE CASCADE NOT NULL,
  full_name TEXT NOT NULL, age INTEGER, grade TEXT,
  curriculum TEXT CHECK (curriculum IN ('CBC', 'British', 'Montessori', 'Custom')),
  subjects TEXT[] DEFAULT '{}', start_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Parents can view own students" ON public.students FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.parents WHERE parents.id = students.parent_id AND parents.user_id = auth.uid())
);
CREATE POLICY "Admins can manage students" ON public.students FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Tutor assignments
CREATE TABLE public.tutor_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tutor_id UUID REFERENCES public.tutors(id) ON DELETE CASCADE NOT NULL,
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
  assigned_by UUID REFERENCES auth.users(id),
  start_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tutor_id, student_id)
);
ALTER TABLE public.tutor_assignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage assignments" ON public.tutor_assignments FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Tutors can view own assignments" ON public.tutor_assignments FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.tutors WHERE tutors.id = tutor_assignments.tutor_id AND tutors.user_id = auth.uid())
);
CREATE POLICY "Parents can view assignments" ON public.tutor_assignments FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.students s JOIN public.parents p ON p.id = s.parent_id WHERE s.id = tutor_assignments.student_id AND p.user_id = auth.uid())
);

-- Now add tutor assignment RLS to students
CREATE POLICY "Tutors can view assigned students" ON public.students FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.tutor_assignments ta JOIN public.tutors t ON t.id = ta.tutor_id WHERE ta.student_id = students.id AND t.user_id = auth.uid())
);

-- Leads (public insert)
CREATE TABLE public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_name TEXT NOT NULL, email TEXT NOT NULL, phone TEXT,
  child_name TEXT, child_age INTEGER, grade TEXT,
  curriculum_interest TEXT, referral_source TEXT, message TEXT,
  status TEXT NOT NULL DEFAULT 'New' CHECK (status IN ('New', 'Contacted', 'Consultation Booked', 'Enrolled', 'Inactive')),
  notes TEXT, follow_up_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can insert leads" ON public.leads FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can manage leads" ON public.leads FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Lessons
CREATE TABLE public.lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tutor_id UUID REFERENCES public.tutors(id) ON DELETE CASCADE NOT NULL,
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
  subject TEXT NOT NULL, date DATE NOT NULL,
  topics_covered TEXT, homework TEXT, comments TEXT,
  performance_rating TEXT CHECK (performance_rating IN ('Excellent', 'Good', 'Needs Improvement')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tutors can manage own lessons" ON public.lessons FOR ALL USING (
  EXISTS (SELECT 1 FROM public.tutors WHERE tutors.id = lessons.tutor_id AND tutors.user_id = auth.uid())
);
CREATE POLICY "Admins can manage lessons" ON public.lessons FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Parents can view lessons" ON public.lessons FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.students s JOIN public.parents p ON p.id = s.parent_id WHERE s.id = lessons.student_id AND p.user_id = auth.uid())
);

-- Attendance
CREATE TABLE public.attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
  tutor_id UUID REFERENCES public.tutors(id) ON DELETE CASCADE NOT NULL,
  lesson_date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('present', 'absent', 'excused')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tutors can manage attendance" ON public.attendance FOR ALL USING (
  EXISTS (SELECT 1 FROM public.tutors WHERE tutors.id = attendance.tutor_id AND tutors.user_id = auth.uid())
);
CREATE POLICY "Admins can manage attendance" ON public.attendance FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Parents can view attendance" ON public.attendance FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.students s JOIN public.parents p ON p.id = s.parent_id WHERE s.id = attendance.student_id AND p.user_id = auth.uid())
);

-- Tasks
CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tutor_id UUID REFERENCES public.tutors(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL, description TEXT, due_date DATE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'done')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tutors can view own tasks" ON public.tasks FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.tutors WHERE tutors.id = tasks.tutor_id AND tutors.user_id = auth.uid())
);
CREATE POLICY "Tutors can update own tasks" ON public.tasks FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.tutors WHERE tutors.id = tasks.tutor_id AND tutors.user_id = auth.uid())
);
CREATE POLICY "Admins can manage tasks" ON public.tasks FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Payments
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
  description TEXT, amount_kes INTEGER NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Paid', 'Pending', 'Overdue')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage payments" ON public.payments FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Parents can view own payments" ON public.payments FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.students s JOIN public.parents p ON p.id = s.parent_id WHERE s.id = payments.student_id AND p.user_id = auth.uid())
);

-- Earnings
CREATE TABLE public.earnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tutor_id UUID REFERENCES public.tutors(id) ON DELETE CASCADE NOT NULL,
  description TEXT, amount_kes INTEGER NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.earnings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tutors can view own earnings" ON public.earnings FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.tutors WHERE tutors.id = earnings.tutor_id AND tutors.user_id = auth.uid())
);
CREATE POLICY "Admins can manage earnings" ON public.earnings FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Announcements
CREATE TABLE public.announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message TEXT NOT NULL,
  target_role TEXT NOT NULL CHECK (target_role IN ('parent', 'teacher', 'all')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage announcements" ON public.announcements FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can view targeted announcements" ON public.announcements FOR SELECT USING (
  target_role = 'all' OR
  (target_role = 'parent' AND public.has_role(auth.uid(), 'parent')) OR
  (target_role = 'teacher' AND public.has_role(auth.uid(), 'teacher'))
);

-- Documents
CREATE TABLE public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
  file_name TEXT NOT NULL, file_url TEXT NOT NULL,
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage documents" ON public.documents FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Parents can view own documents" ON public.documents FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.students s JOIN public.parents p ON p.id = s.parent_id WHERE s.id = documents.student_id AND p.user_id = auth.uid())
);
CREATE POLICY "Tutors can manage docs for assigned students" ON public.documents FOR ALL USING (
  EXISTS (SELECT 1 FROM public.tutor_assignments ta JOIN public.tutors t ON t.id = ta.tutor_id WHERE ta.student_id = documents.student_id AND t.user_id = auth.uid())
);

-- Storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', false);
CREATE POLICY "Auth users can upload docs" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'documents' AND auth.role() = 'authenticated');
CREATE POLICY "Auth users can view docs" ON storage.objects FOR SELECT USING (bucket_id = 'documents' AND auth.role() = 'authenticated');

-- Get user role function
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS TEXT LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT role::TEXT FROM public.user_roles WHERE user_id = _user_id LIMIT 1 $$;
