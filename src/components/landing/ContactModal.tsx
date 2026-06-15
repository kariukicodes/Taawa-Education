import { useState } from "react";
import { CheckCircle, X } from "lucide-react";

import { submitPublicLead } from "@/lib/publicLeadSubmission";

interface ContactModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface FormErrors {
  parent_name?: string;
  email?: string;
  phone?: string;
  grade?: string;
  curriculum_interest?: string;
  message?: string;
}

export function ContactModal({ open, onOpenChange }: ContactModalProps) {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});

  const [form, setForm] = useState({
    parent_name: "",
    email: "",
    phone: "",
    grade: "",
    curriculum_interest: "",
    message: "",
  });

  if (!open) return null;

  const validate = () => {
    const nextErrors: FormErrors = {};

    if (!form.parent_name.trim()) nextErrors.parent_name = "Full name is required";

    if (!form.email.trim()) nextErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      nextErrors.email = "Invalid email format";
    }

    if (!form.phone.trim()) nextErrors.phone = "Phone is required";
    if (!form.grade.trim()) nextErrors.grade = "Grade / age is required";
    if (!form.curriculum_interest) nextErrors.curriculum_interest = "Please select a curriculum";
    if (!form.message.trim()) nextErrors.message = "Message is required";

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const update = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setServerError("");

    if (!validate()) return;

    setLoading(true);

    try {
      await submitPublicLead({
        parent_name: form.parent_name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        grade: form.grade.trim(),
        curriculum_interest: form.curriculum_interest,
        message: form.message.trim(),
        status: "New",
      });

      setSubmitted(true);
    } catch (error) {
      setServerError(
        error instanceof Error ? error.message : "Something went wrong. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (field: keyof FormErrors) =>
    `w-full rounded-xl border ${
      errors[field] ? "border-destructive" : "border-white/[0.08]"
    } bg-[#0F0F0F] px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/40`;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-xl rounded-[28px] border border-white/[0.08] bg-[#131310] p-6 shadow-2xl shadow-black/50">
        <button
          type="button"
          aria-label="Close"
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border border-white/[0.08] text-muted-foreground transition-colors hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>

        {submitted ? (
          <div className="py-10 text-center">
            <CheckCircle className="mx-auto h-14 w-14 text-primary" />
            <h3 className="font-display mt-6 text-2xl font-bold text-foreground">
              Thank you for reaching out
            </h3>
            <p className="mx-auto mt-3 max-w-md text-[15px] leading-7 text-muted-foreground">
              We've received your inquiry and our team will be in touch shortly.
            </p>

            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="mt-6 inline-flex rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground"
            >
              Close
            </button>
          </div>
        ) : (
          <>
            <div className="text-center">
              <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-primary">
                Private consultation
              </p>
              <h2 className="font-display mt-3 text-[30px] font-bold tracking-[-0.03em] text-foreground sm:text-[34px]">
                Tell us about your child's needs
              </h2>
              <p className="mx-auto mt-3 max-w-md text-[15px] leading-7 text-muted-foreground">
                Share what you're aiming for and we'll guide you on the best next step.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              {serverError && (
                <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                  {serverError}
                </div>
              )}

              <div>
                <input
                  className={inputClass("parent_name")}
                  value={form.parent_name}
                  onChange={(event) => update("parent_name", event.target.value)}
                  placeholder="Parent full name"
                />
                {errors.parent_name && (
                  <p className="mt-1 text-xs text-destructive">{errors.parent_name}</p>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <input
                    type="email"
                    className={inputClass("email")}
                    value={form.email}
                    onChange={(event) => update("email", event.target.value)}
                    placeholder="Email address"
                  />
                  {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email}</p>}
                </div>

                <div>
                  <input
                    className={inputClass("phone")}
                    value={form.phone}
                    onChange={(event) => update("phone", event.target.value)}
                    placeholder="Phone number"
                  />
                  {errors.phone && <p className="mt-1 text-xs text-destructive">{errors.phone}</p>}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <input
                    className={inputClass("grade")}
                    value={form.grade}
                    onChange={(event) => update("grade", event.target.value)}
                    placeholder="Child's grade / age"
                  />
                  {errors.grade && <p className="mt-1 text-xs text-destructive">{errors.grade}</p>}
                </div>

                <div>
                  <select
                    className={inputClass("curriculum_interest")}
                    value={form.curriculum_interest}
                    onChange={(event) => update("curriculum_interest", event.target.value)}
                  >
                    <option value="">Select curriculum</option>
                    <option value="CBC">CBC</option>
                    <option value="British">British Curriculum</option>
                    <option value="Montessori">Montessori</option>
                    <option value="Custom">Custom Learning Plan</option>
                  </select>
                  {errors.curriculum_interest && (
                    <p className="mt-1 text-xs text-destructive">{errors.curriculum_interest}</p>
                  )}
                </div>
              </div>

              <div>
                <textarea
                  rows={4}
                  className={inputClass("message")}
                  value={form.message}
                  onChange={(event) => update("message", event.target.value)}
                  placeholder="Tell us about your child's needs and goals"
                />
                {errors.message && (
                  <p className="mt-1 text-xs text-destructive">{errors.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
              >
                {loading ? "Submitting..." : "Submit Inquiry"}
              </button>
            </form>

            <div className="mt-6 rounded-2xl border border-white/[0.08] bg-black/20 p-5">
              <h3 className="font-display text-[20px] font-bold tracking-[-0.02em] text-foreground">
                What you'll get
              </h3>
              <ul className="mt-3 space-y-2 text-[14px] leading-7 text-muted-foreground">
                <li>Clear next-step recommendations based on your goals</li>
                <li>Program and tutor-fit guidance for your child</li>
                <li>A simple plan to get started quickly</li>
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
