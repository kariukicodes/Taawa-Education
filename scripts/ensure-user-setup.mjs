import { createClient } from "@supabase/supabase-js";

function getArg(name) {
  const index = process.argv.indexOf(`--${name}`);
  if (index === -1) return undefined;
  return process.argv[index + 1];
}

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing env vars: SUPABASE_URL and/or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const userId = getArg("user-id");
const role = getArg("role");
const fullName = getArg("full-name") ?? "Test User";
const phone = getArg("phone") ?? null;

if (!userId || !role) {
  console.error(
    "Usage: node scripts/ensure-user-setup.mjs --user-id <uuid> --role <admin|parent|teacher> [--full-name <name>] [--phone <phone>]"
  );
  process.exit(1);
}

if (![("admin"), ("parent"), ("teacher")].includes(role)) {
  console.error("Invalid --role. Must be one of: admin, parent, teacher");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function main() {
  const { error: roleError } = await supabase
    .from("user_roles")
    .upsert({ user_id: userId, role }, { onConflict: "user_id,role" });

  if (roleError) throw roleError;

  if (role === "parent") {
    const { error } = await supabase
      .from("parents")
      .upsert({ user_id: userId, full_name: fullName, phone }, { onConflict: "user_id" });

    if (error) throw error;
  }

  if (role === "teacher") {
    const { error } = await supabase
      .from("tutors")
      .upsert(
        { user_id: userId, full_name: fullName, phone, subjects: [], rate_kes: 0, status: "active" },
        { onConflict: "user_id" }
      );

    if (error) throw error;
  }

  console.log(JSON.stringify({ ok: true, user_id: userId, role }, null, 2));
}

main().catch((err) => {
  console.error("Failed to ensure user setup", err);
  process.exit(1);
});
