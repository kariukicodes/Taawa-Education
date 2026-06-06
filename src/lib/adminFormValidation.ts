export function validateParentAccountInput(input: {
  full_name: string;
  email: string;
  password: string;
}) {
  if (!input.full_name.trim()) return "Parent full name is required.";
  if (!input.email.trim()) return "Parent email is required.";
  if (input.password.length < 8) return "Temporary password must be at least 8 characters.";
  return null;
}

export function validateTutorAccountInput(input: {
  full_name: string;
  email: string;
  password: string;
}) {
  if (!input.full_name.trim()) return "Tutor full name is required.";
  if (!input.email.trim()) return "Tutor email is required.";
  if (input.password.length < 8) return "Temporary password must be at least 8 characters.";
  return null;
}

export function validateStudentInput(input: {
  full_name: string;
  age: string;
  grade: string;
  create_new_parent?: boolean;
  parent_id?: string;
  parent_full_name?: string;
  parent_email?: string;
  parent_password?: string;
}, mode: "create" | "edit") {
  const age = parseInt(input.age, 10);

  if (!input.full_name.trim()) return "Student name is required.";
  if (!Number.isFinite(age)) return "Student age is required.";
  if (!input.grade.trim()) return "Student grade is required.";

  if (mode === "edit") {
    if (!input.parent_id) return "Please select a parent.";
    return null;
  }

  if (input.create_new_parent) {
    if (!input.parent_full_name?.trim()) return "Parent full name is required.";
    if (!input.parent_email?.trim()) return "Parent email is required.";
    if ((input.parent_password?.length ?? 0) < 8) {
      return "Parent temporary password must be at least 8 characters.";
    }
    return null;
  }

  if (!input.parent_id) return "Please select a parent.";
  return null;
}
