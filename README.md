# EduNest Pathways

Admin, parent, and tutor portal for managing students, leads, assignments, payments, reports, tasks, and announcements on Supabase.

## Stack

- `Vite` + `React` + `TypeScript`
- `Supabase Auth`, `Postgres`, and `Edge Functions`
- `shadcn/ui` + `Tailwind CSS`

## Environment Variables

Create `.env.local` for local development:

```env
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
VITE_SUPABASE_PROJECT_ID=your-project-ref
```

Supabase Edge Functions also need these project secrets configured in the Supabase dashboard:

- `SUPABASE_URL`
- `SUPABASE_PUBLISHABLE_KEY` or `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

Optional native meeting integrations:

- Google Meet / Google Calendar
  - `GOOGLE_CLIENT_ID`
  - `GOOGLE_CLIENT_SECRET`
  - `GOOGLE_REFRESH_TOKEN`
  - `GOOGLE_CALENDAR_ID`
- Zoom Server-to-Server OAuth
  - `ZOOM_ACCOUNT_ID`
  - `ZOOM_CLIENT_ID`
  - `ZOOM_CLIENT_SECRET`
  - `ZOOM_HOST_USER_ID`

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Log in to Supabase CLI:

```bash
supabase login
```

3. Link the local repo to the correct Supabase project:

```bash
supabase link --project-ref <your-project-ref>
```

4. Apply migrations:

```bash
supabase db push
```

5. Start the app:

```bash
npm run dev
```

The Vite dev server is configured to open the browser automatically.

## Edge Functions

Current admin flows depend on these live Edge Functions:

- `create-parent-user`
- `create-student-admin`
- `create-tutor-user`
- `get-admin-overview`
- `get-parent-dashboard`
- `get-parent-messages`
- `get-parent-workspace`
- `get-teacher-dashboard`
- `get-teacher-messages`
- `get-teacher-workspace`
- `list-announcements-admin`
- `list-assignments-admin`
- `list-leads-admin`
- `list-parents-admin`
- `list-payments-admin`
- `list-reports-admin`
- `list-students-admin`
- `list-tasks-admin`
- `list-tutors-admin`
- `manage-announcement-admin`
- `manage-assignment-admin`
- `manage-lead-admin`
- `manage-parent-admin`
- `manage-student-admin`
- `manage-task-admin`
- `manage-tutor-admin`
- `manage-user-account-admin`
- `send-parent-message`
- `send-teacher-message`

Deploy one function:

```bash
supabase functions deploy manage-user-account-admin
```

Deploy the full admin set:

```bash
supabase functions deploy create-parent-user
supabase functions deploy create-student-admin
supabase functions deploy create-tutor-user
supabase functions deploy get-admin-overview
supabase functions deploy get-parent-dashboard
supabase functions deploy get-parent-messages
supabase functions deploy get-parent-workspace
supabase functions deploy get-teacher-dashboard
supabase functions deploy get-teacher-messages
supabase functions deploy get-teacher-workspace
supabase functions deploy list-announcements-admin
supabase functions deploy list-assignments-admin
supabase functions deploy list-leads-admin
supabase functions deploy list-parents-admin
supabase functions deploy list-payments-admin
supabase functions deploy list-reports-admin
supabase functions deploy list-students-admin
supabase functions deploy list-tasks-admin
supabase functions deploy list-tutors-admin
supabase functions deploy manage-announcement-admin
supabase functions deploy manage-assignment-admin
supabase functions deploy manage-lead-admin
supabase functions deploy manage-parent-admin
supabase functions deploy manage-student-admin
supabase functions deploy manage-task-admin
supabase functions deploy manage-tutor-admin
supabase functions deploy manage-user-account-admin
supabase functions deploy send-parent-message
supabase functions deploy send-teacher-message
```

## Demo Data

Demo mode is opt-in only. To enable local demo fallbacks, add this to `.env.local`:

```env
VITE_ENABLE_DEMO_MODE=true
```

Leave it unset for normal live-data behavior.

## Testing

Run TypeScript:

```bash
npx tsc --noEmit
```

Run frontend/unit tests:

```bash
npm test
```

## Manual Regression Checklist

Run this before every deploy:

1. Create a tutor and confirm the tutor appears immediately in the admin list.
2. Create a parent and confirm the parent appears immediately in the admin list.
3. Create a student with an existing parent.
4. Create a student with `Add parent now` enabled.
5. Edit, archive/restore, and delete a tutor.
6. Edit, archive/restore, and delete a parent.
7. Edit, archive/restore, and delete a student.
8. Create, edit, and remove a tutor assignment.
9. Create, edit, complete, reopen, and delete a task.
10. Create, update, convert, and delete a lead.
11. Create, edit, and delete an announcement.
12. Use `Invite Link` and `Reset Password` on a parent and a tutor.
13. Confirm Overview counts change after create/archive/delete actions.
14. Confirm recent activity updates on the Overview page.
15. Create a tutor-to-parent in-app message and confirm it appears on both dashboards.
16. Create a parent-to-tutor reply and confirm unread counts clear after opening the thread.
17. Create an assignment with a recurring schedule and verify the schedule/reminder text appears on admin, tutor, and parent views.
18. If Google or Zoom secrets are configured, leave the meeting link blank and confirm the native meeting link is auto-created.
19. Hard refresh the browser and verify data still loads from the live database.

## Production Notes

- All admin Edge Functions should verify admin role server-side before privileged actions.
- Browser flows should use the publishable key only.
- The service role key must stay in Supabase function secrets only.
- Apply migrations before deploying functions that depend on new schema changes.
- Use `seed-demo-data` only in non-production environments.
