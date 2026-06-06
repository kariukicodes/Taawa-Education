WITH ranked_assignments AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY student_id
      ORDER BY created_at ASC, id ASC
    ) AS row_number
  FROM public.tutor_assignments
)
DELETE FROM public.tutor_assignments
WHERE id IN (
  SELECT id
  FROM ranked_assignments
  WHERE row_number > 1
);

CREATE UNIQUE INDEX IF NOT EXISTS tutor_assignments_one_student_unique
ON public.tutor_assignments (student_id);
