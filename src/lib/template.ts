export function renderTemplate(
  template: string,
  variables: Record<string, string>
): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => {
    return variables[key] ?? `{{${key}}}`;
  });
}

export function generateWhatsAppLink(phone: string, message: string): string {
  const cleaned = phone.replace(/[^0-9+]/g, "");
  const number = cleaned.startsWith("+") ? cleaned.slice(1) : cleaned;
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
