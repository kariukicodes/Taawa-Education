import { describe, expect, it } from "vitest";

import {
  validateParentAccountInput,
  validateStudentInput,
  validateTutorAccountInput,
} from "@/lib/adminFormValidation";

describe("adminFormValidation", () => {
  it("validates parent and tutor account inputs", () => {
    expect(
      validateParentAccountInput({
        full_name: "",
        email: "parent@example.com",
        password: "password123",
      }),
    ).toBe("Parent full name is required.");

    expect(
      validateTutorAccountInput({
        full_name: "Tutor Test",
        email: "",
        password: "password123",
      }),
    ).toBe("Tutor email is required.");

    expect(
      validateTutorAccountInput({
        full_name: "Tutor Test",
        email: "tutor@example.com",
        password: "password123",
      }),
    ).toBeNull();
  });

  it("validates create and edit student flows", () => {
    expect(
      validateStudentInput(
        {
          full_name: "Student One",
          age: "12",
          grade: "6",
          create_new_parent: false,
          parent_id: "",
        },
        "create",
      ),
    ).toBe("Please select a parent.");

    expect(
      validateStudentInput(
        {
          full_name: "Student One",
          age: "12",
          grade: "6",
          create_new_parent: true,
          parent_full_name: "Parent One",
          parent_email: "parent@example.com",
          parent_password: "short",
        },
        "create",
      ),
    ).toBe("Parent temporary password must be at least 8 characters.");

    expect(
      validateStudentInput(
        {
          full_name: "Student One",
          age: "12",
          grade: "6",
          parent_id: "parent-1",
        },
        "edit",
      ),
    ).toBeNull();
  });
});
