export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export async function findAuthUserByEmail(adminSupabase: any, email: string) {
  const normalizedEmail = normalizeEmail(email);
  let page = 1;

  while (true) {
    const { data, error } = await adminSupabase.auth.admin.listUsers({
      page,
      perPage: 200,
    });

    if (error) throw error;

    const users = data?.users ?? [];
    const existingUser = users.find(
      (user: { email?: string | null }) => normalizeEmail(user.email ?? "") === normalizedEmail,
    );

    if (existingUser) {
      return existingUser;
    }

    if (users.length < 200) {
      return null;
    }

    page += 1;
  }
}

export async function ensureEmailAvailable(adminSupabase: any, email: string) {
  const existingUser = await findAuthUserByEmail(adminSupabase, email);

  if (existingUser) {
    throw new Error("An account with this email already exists.");
  }
}

export async function getAuthUserDetails(adminSupabase: any, userId: string | null) {
  if (!userId) {
    return {
      account_email: null,
      last_sign_in_at: null,
      has_login: false,
    };
  }

  const { data, error } = await adminSupabase.auth.admin.getUserById(userId);

  if (error) throw error;

  return {
    account_email: data.user?.email ?? null,
    last_sign_in_at: data.user?.last_sign_in_at ?? null,
    has_login: true,
  };
}
