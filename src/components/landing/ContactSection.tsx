import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle } from "lucide-react";

interface FormErrors {
  parent_name?: string;
  email?: string;
  phone?: string;
  child_name?: string;
  child_age?: string;
  grade?: string;
  curriculum_interest?: string;
  message?: string;
}

export function ContactSection() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [serverError, setServerError] = useState("");

  const [form, setForm] = useState({
    parent_name: "",
    email: "",
    phone: "",
    child_name: "",
    child_age: "",
    grade: "",
    curriculum_interest: "",
    referral_source: "",
    message: "",
  });

  const validate = (): boolean => {
    const e: FormErrors = {};
    if (!form.parent_name.trim()) e.parent_name = "Full name is required";
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Invalid email format";
    if (!form.phone.trim()) e.phone = "Phone is required";
    else if (!/^(\+254|07)/.test(form.phone)) e.phone = "Phone must start with +254 or 07";
    if (!form.child_name.trim()) e.child_name = "Child's name is required";
    if (!form.child_age) e.child_age = "Age is required";
    if (!form.grade.trim()) e.grade = "Grade is required";
    if (!form.curriculum_interest) e.curriculum_interest = "Please select a curriculum";
    if (!form.message.trim()) e.message = "Message is required";
    else if (form.message.trim().length < 20) e.message = "Message must be at least 20 characters";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError("");
    if (!validate()) return;
    setLoading(true);

    const { error } = await supabase.from("leads").insert({
      parent_name: form.parent_name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      child_name: form.child_name.trim(),
      child_age: parseInt(form.child_age),
      grade: form.grade.trim(),
      curriculum_interest: form.curriculum_interest,
      referral_source: form.referral_source || null,
      message: form.message.trim(),
      status: "New",
    });

    setLoading(false);
    if (error) {
      setServerError("Something went wrong. Please try again.");
    } else {
      setSubmitted(true);
    }
  };

  const update = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const inputClass = (field: keyof FormErrors) =>
    `w-full rounded-lg border ${
      errors[field] ? "border-destructive" : "border-border"
    } bg-muted px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary`;

  if (submitted) {
    return (
      <section id="contact" className="py-24 px-3 lg:px-3">
        <div className="mx-auto max-w-lg text-center">
          <CheckCircle className="mx-auto h-16 w-16 text-primary" />
          <h2 className="mt-6 text-2xl font-bold text-foreground">Thank You for Reaching Out</h2>
          <p className="mt-3 text-muted-foreground">
            Our team will be in touch within 24 hours.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section id="contact" className="py-24 px-6">
      <div className="mx-auto max-w-2xl">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Contact</p>
          <h2 className="mt-3 text-3xl font-bold text-foreground md:text-4xl">
            Start Your Child's Journey
          </h2>
          <p className="mt-4 text-muted-foreground">
            Fill in the form below and our team will schedule a free consultation.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-12 space-y-5">
          {serverError && (
            <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              {serverError}
            </div>
          )}

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Parent Full Name</label>
              <input className={inputClass("parent_name")} value={form.parent_name} onChange={(e) => update("parent_name", e.target.value)} placeholder="Jane Wanjiku" />
              {errors.parent_name && <p className="mt-1 text-xs text-destructive">{errors.parent_name}</p>}
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Email</label>
              <input type="email" className={inputClass("email")} value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="jane@example.com" />
              {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email}</p>}
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Phone Number</label>
              <input className={inputClass("phone")} value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="+254 712 345 678" />
              {errors.phone && <p className="mt-1 text-xs text-destructive">{errors.phone}</p>}
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Child's Name</label>
              <input className={inputClass("child_name")} value={form.child_name} onChange={(e) => update("child_name", e.target.value)} placeholder="Zara" />
              {errors.child_name && <p className="mt-1 text-xs text-destructive">{errors.child_name}</p>}
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Child's Age</label>
              <input type="number" min="3" max="18" className={inputClass("child_age")} value={form.child_age} onChange={(e) => update("child_age", e.target.value)} placeholder="10" />
              {errors.child_age && <p className="mt-1 text-xs text-destructive">{errors.child_age}</p>}
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Current Grade</label>
              <input className={inputClass("grade")} value={form.grade} onChange={(e) => update("grade", e.target.value)} placeholder="Grade 5" />
              {errors.grade && <p className="mt-1 text-xs text-destructive">{errors.grade}</p>}
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Curriculum Interest</label>
              <select className={inputClass("curriculum_interest")} value={form.curriculum_interest} onChange={(e) => update("curriculum_interest", e.target.value)}>
                <option value="">Select...</option>
                <option value="CBC">CBC</option>
                <option value="British">British Curriculum</option>
                <option value="Montessori">Montessori</option>
                <option value="Custom">Custom</option>
              </select>
              {errors.curriculum_interest && <p className="mt-1 text-xs text-destructive">{errors.curriculum_interest}</p>}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">How did you hear about us?</label>
            <select className={`w-full rounded-lg border border-border bg-muted px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none`} value={form.referral_source} onChange={(e) => update("referral_source", e.target.value)}>
              <option value="">Select (optional)</option>
              <option value="Google">Google</option>
              <option value="Instagram">Instagram</option>
              <option value="Referral">Friend / Referral</option>
              <option value="School">School</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Message</label>
            <textarea rows={4} className={inputClass("message")} value={form.message} onChange={(e) => update("message", e.target.value)} placeholder="Tell us about your child's needs, goals, and any specific requirements..." />
            {errors.message && <p className="mt-1 text-xs text-destructive">{errors.message}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-primary py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50 sm:w-auto sm:px-12"
          >
            {loading ? "Submitting..." : "Submit Inquiry"}
          </button>
        </form>
      </div>
    </section>
  );
}
