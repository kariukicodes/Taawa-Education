ALTER TABLE public.tutor_assignments
ADD COLUMN IF NOT EXISTS session_day_of_week SMALLINT
CHECK (session_day_of_week BETWEEN 0 AND 6),
ADD COLUMN IF NOT EXISTS session_start_time TIME,
ADD COLUMN IF NOT EXISTS session_end_time TIME,
ADD COLUMN IF NOT EXISTS session_frequency TEXT NOT NULL DEFAULT 'weekly'
CHECK (session_frequency IN ('weekly', 'biweekly')),
ADD COLUMN IF NOT EXISTS session_timezone TEXT NOT NULL DEFAULT 'Africa/Nairobi',
ADD COLUMN IF NOT EXISTS session_end_date DATE,
ADD COLUMN IF NOT EXISTS reminder_enabled BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN IF NOT EXISTS reminder_offset_minutes INTEGER NOT NULL DEFAULT 60
CHECK (reminder_offset_minutes BETWEEN 5 AND 10080),
ADD COLUMN IF NOT EXISTS external_meeting_id TEXT;

CREATE TABLE IF NOT EXISTS public.message_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID NOT NULL REFERENCES public.parents(id) ON DELETE CASCADE,
  tutor_id UUID NOT NULL REFERENCES public.tutors(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  parent_last_read_at TIMESTAMPTZ,
  tutor_last_read_at TIMESTAMPTZ,
  last_message_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (parent_id, tutor_id, student_id)
);

ALTER TABLE public.message_threads ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID NOT NULL REFERENCES public.message_threads(id) ON DELETE CASCADE,
  sender_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sender_role public.app_role NOT NULL,
  body TEXT NOT NULL CHECK (length(trim(body)) > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS message_threads_parent_idx
ON public.message_threads (parent_id, last_message_at DESC);

CREATE INDEX IF NOT EXISTS message_threads_tutor_idx
ON public.message_threads (tutor_id, last_message_at DESC);

CREATE INDEX IF NOT EXISTS messages_thread_created_idx
ON public.messages (thread_id, created_at DESC);

CREATE OR REPLACE FUNCTION public.set_updated_at_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.touch_message_thread_activity()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.message_threads
  SET
    last_message_at = NEW.created_at,
    updated_at = now(),
    parent_last_read_at = CASE
      WHEN NEW.sender_role = 'parent' THEN NEW.created_at
      ELSE parent_last_read_at
    END,
    tutor_last_read_at = CASE
      WHEN NEW.sender_role = 'teacher' THEN NEW.created_at
      ELSE tutor_last_read_at
    END
  WHERE id = NEW.thread_id;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_message_threads_updated_at ON public.message_threads;
CREATE TRIGGER set_message_threads_updated_at
BEFORE UPDATE ON public.message_threads
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at_timestamp();

DROP TRIGGER IF EXISTS touch_message_thread_activity ON public.messages;
CREATE TRIGGER touch_message_thread_activity
AFTER INSERT ON public.messages
FOR EACH ROW
EXECUTE FUNCTION public.touch_message_thread_activity();

DROP POLICY IF EXISTS "Admins can manage message threads" ON public.message_threads;
CREATE POLICY "Admins can manage message threads"
ON public.message_threads
FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Parents can view own message threads" ON public.message_threads;
CREATE POLICY "Parents can view own message threads"
ON public.message_threads
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.parents
    WHERE parents.id = message_threads.parent_id
      AND parents.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Parents can update own message threads" ON public.message_threads;
CREATE POLICY "Parents can update own message threads"
ON public.message_threads
FOR UPDATE
USING (
  EXISTS (
    SELECT 1
    FROM public.parents
    WHERE parents.id = message_threads.parent_id
      AND parents.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.parents
    WHERE parents.id = message_threads.parent_id
      AND parents.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Tutors can view own message threads" ON public.message_threads;
CREATE POLICY "Tutors can view own message threads"
ON public.message_threads
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.tutors
    WHERE tutors.id = message_threads.tutor_id
      AND tutors.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Tutors can update own message threads" ON public.message_threads;
CREATE POLICY "Tutors can update own message threads"
ON public.message_threads
FOR UPDATE
USING (
  EXISTS (
    SELECT 1
    FROM public.tutors
    WHERE tutors.id = message_threads.tutor_id
      AND tutors.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.tutors
    WHERE tutors.id = message_threads.tutor_id
      AND tutors.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Admins can manage messages" ON public.messages;
CREATE POLICY "Admins can manage messages"
ON public.messages
FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Parents can view own messages" ON public.messages;
CREATE POLICY "Parents can view own messages"
ON public.messages
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.message_threads mt
    JOIN public.parents p ON p.id = mt.parent_id
    WHERE mt.id = messages.thread_id
      AND p.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Parents can send own messages" ON public.messages;
CREATE POLICY "Parents can send own messages"
ON public.messages
FOR INSERT
WITH CHECK (
  sender_user_id = auth.uid()
  AND sender_role = 'parent'
  AND EXISTS (
    SELECT 1
    FROM public.message_threads mt
    JOIN public.parents p ON p.id = mt.parent_id
    WHERE mt.id = messages.thread_id
      AND p.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Tutors can view own messages" ON public.messages;
CREATE POLICY "Tutors can view own messages"
ON public.messages
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.message_threads mt
    JOIN public.tutors t ON t.id = mt.tutor_id
    WHERE mt.id = messages.thread_id
      AND t.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Tutors can send own messages" ON public.messages;
CREATE POLICY "Tutors can send own messages"
ON public.messages
FOR INSERT
WITH CHECK (
  sender_user_id = auth.uid()
  AND sender_role = 'teacher'
  AND EXISTS (
    SELECT 1
    FROM public.message_threads mt
    JOIN public.tutors t ON t.id = mt.tutor_id
    WHERE mt.id = messages.thread_id
      AND t.user_id = auth.uid()
  )
);
