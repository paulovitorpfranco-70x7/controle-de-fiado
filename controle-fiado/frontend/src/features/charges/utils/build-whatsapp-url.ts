export function buildWhatsAppUrl(phoneE164: string, message: string) {
  const normalizedPhone = phoneE164.replace(/[^\d]/g, "");
  return `https://api.whatsapp.com/send?phone=${normalizedPhone}&text=${encodeURIComponent(message)}`;
}
