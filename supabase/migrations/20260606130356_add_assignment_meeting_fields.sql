ALTER TABLE public.tutor_assignments
ADD COLUMN IF NOT EXISTS meeting_provider TEXT
CHECK (meeting_provider IN ('google_meet', 'zoom', 'custom')),
ADD COLUMN IF NOT EXISTS meeting_link TEXT;
