ALTER TABLE public.parents
ADD COLUMN status TEXT NOT NULL DEFAULT 'active'
  CHECK (status IN ('active', 'inactive')),
ADD COLUMN archived_at TIMESTAMPTZ;

ALTER TABLE public.students
ADD COLUMN status TEXT NOT NULL DEFAULT 'active'
  CHECK (status IN ('active', 'inactive')),
ADD COLUMN archived_at TIMESTAMPTZ;
