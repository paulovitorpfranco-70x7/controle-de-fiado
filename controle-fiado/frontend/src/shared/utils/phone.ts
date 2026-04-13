export function normalizeBrazilPhoneToE164(phone: string | null | undefined) {
  if (!phone) {
    return null;
  }

  const digits = phone.replace(/\D/g, "");

  if (!digits) {
    return null;
  }

  if (digits.length < 10) {
    return null;
  }

  if (digits.startsWith("55")) {
    return `+${digits}`;
  }

  return `+55${digits}`;
}
