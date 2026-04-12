export function buildWhatsAppUrl(phoneE164: string, message: string) {
  const normalizedPhone = phoneE164.replace(/[^\d]/g, "");
  return `https://wa.me/${normalizedPhone}?text=${encodeURIComponent(message)}`;
}
