import { prisma } from "../../lib/prisma.js";
import type { CreateCustomerInput, UpdateCustomerInput } from "./customer.schemas.js";

function toPhoneE164(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (!digits) return null;
  if (digits.startsWith("55")) return `+${digits}`;
  return `+55${digits}`;
}

function toCurrencyNumberFromCents(value: number | null) {
  if (value === null) return null;
  return value / 100;
}

function toCents(value: number | undefined) {
  if (value === undefined) return undefined;
  return Math.round(value * 100);
}

export async function listCustomers() {
  const customers = await prisma.customer.findMany({
    orderBy: { name: "asc" },
    include: {
      sales: {
        where: {
          status: {
            in: ["OPEN", "PARTIAL", "OVERDUE"]
          }
        },
        select: {
          remainingAmountCents: true
        }
      }
    }
  });

  return customers.map((customer) => {
    const openBalance = customer.sales.reduce((total, sale) => total + sale.remainingAmountCents, 0) / 100;
    return {
      id: customer.id,
      name: customer.name,
      phone: customer.phone,
      phoneE164: customer.phoneE164,
      address: customer.address,
      creditLimit: toCurrencyNumberFromCents(customer.creditLimitCents),
      notes: customer.notes,
      isActive: customer.isActive,
      openBalance,
      createdAt: customer.createdAt
    };
  });
}

export async function createCustomer(input: CreateCustomerInput) {
  const customer = await prisma.customer.create({
    data: {
      name: input.name,
      phone: input.phone,
      phoneE164: toPhoneE164(input.phone),
      address: input.address,
      creditLimitCents: toCents(input.creditLimit),
      notes: input.notes
    }
  });

  return {
    id: customer.id,
    name: customer.name,
    phone: customer.phone,
    phoneE164: customer.phoneE164,
    address: customer.address,
    creditLimit: toCurrencyNumberFromCents(customer.creditLimitCents),
    notes: customer.notes,
    isActive: customer.isActive,
    createdAt: customer.createdAt
  };
}

export async function updateCustomer(id: string, input: UpdateCustomerInput) {
  const customer = await prisma.customer.update({
    where: { id },
    data: {
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.phone !== undefined ? { phone: input.phone, phoneE164: toPhoneE164(input.phone) } : {}),
      ...(input.address !== undefined ? { address: input.address } : {}),
      ...(input.creditLimit !== undefined ? { creditLimitCents: toCents(input.creditLimit) } : {}),
      ...(input.notes !== undefined ? { notes: input.notes } : {})
    }
  });

  return {
    id: customer.id,
    name: customer.name,
    phone: customer.phone,
    phoneE164: customer.phoneE164,
    address: customer.address,
    creditLimit: toCurrencyNumberFromCents(customer.creditLimitCents),
    notes: customer.notes,
    isActive: customer.isActive,
    createdAt: customer.createdAt
  };
}
