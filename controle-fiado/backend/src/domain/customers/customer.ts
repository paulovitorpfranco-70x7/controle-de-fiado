export type Customer = {
  id: string;
  name: string;
  phone: string;
  phoneE164: string | null;
  address: string | null;
  creditLimit: number | null;
  notes: string | null;
  isActive: boolean;
  createdAt: Date;
};

export type CustomerSummary = Customer & {
  openBalance: number;
};

export function toPhoneE164(phone: string) {
  const digits = phone.replace(/\D/g, "");

  if (!digits) return null;
  if (digits.startsWith("55")) return `+${digits}`;

  return `+55${digits}`;
}

export function toCurrencyNumberFromCents(value: number | null) {
  if (value === null) return null;
  return value / 100;
}

export function toCents(value: number | undefined) {
  if (value === undefined) return undefined;
  return Math.round(value * 100);
}
