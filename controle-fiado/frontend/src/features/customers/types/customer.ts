export type Customer = {
  id: string;
  name: string;
  phone: string;
  phoneE164: string | null;
  address: string | null;
  creditLimit: number | null;
  notes: string | null;
  isActive: boolean;
  openBalance: number;
  createdAt: string;
};
