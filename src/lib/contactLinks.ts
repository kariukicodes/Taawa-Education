function normalizePhone(phone: string) {
  return phone.replace(/[^\d+]/g, "");
}

export function buildWhatsAppLink(phone: string, message?: string) {
  const base = `https://wa.me/${normalizePhone(phone).replace(/^\+/, "")}`;

  if (!message?.trim()) {
    return base;
  }

  return `${base}?text=${encodeURIComponent(message)}`;
}

export function buildMailtoLink(email: string, subject?: string, body?: string) {
  const params = new URLSearchParams();

  if (subject?.trim()) {
    params.set("subject", subject);
  }

  if (body?.trim()) {
    params.set("body", body);
  }

  const query = params.toString();
  return `mailto:${email}${query ? `?${query}` : ""}`;
}
