import { supabase } from "@/integrations/supabase/client";
import type { TablesInsert } from "@/integrations/supabase/types";

const PUBLIC_CONTACT_EMAIL = "admissions@taawa.co.ke";
const PUBLIC_CONTACT_PHONE = "+254 704 007 008";

type PublicLeadInsert = TablesInsert<"leads">;

export function getPublicLeadFallbackMessage(context: "inquiry" | "application") {
  const action =
    context === "application"
      ? "submit your application"
      : "send your inquiry";

  return `We couldn't ${action} right now. Please email ${PUBLIC_CONTACT_EMAIL} or call ${PUBLIC_CONTACT_PHONE}.`;
}

export async function submitPublicLead(payload: PublicLeadInsert) {
  const { error } = await supabase.from("leads").insert(payload);

  if (error) {
    throw new Error(getPublicLeadFallbackMessage("inquiry"));
  }
}

export async function submitTutorApplicationLead(params: {
  name: string;
  email: string;
  phone: string;
  experience: string;
  subject: string;
  curriculum: string;
  message?: string;
}) {
  const details = [
    "Tutor application",
    `Experience: ${params.experience}`,
    `Subjects: ${params.subject}`,
    `Curriculum: ${params.curriculum}`,
    params.message?.trim() ? `Message: ${params.message.trim()}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  const { error } = await supabase.from("leads").insert({
    parent_name: params.name.trim(),
    email: params.email.trim(),
    phone: params.phone.trim(),
    grade: "Tutor application",
    curriculum_interest: params.curriculum.trim(),
    referral_source: "Tutor Application",
    message: details,
    status: "New",
  });

  if (error) {
    throw new Error(getPublicLeadFallbackMessage("application"));
  }
}
