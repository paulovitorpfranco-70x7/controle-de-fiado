import { prisma } from "../../../../lib/prisma.js";
import type { CreateCustomerInput, UpdateCustomerInput } from "../../../../application/customers/dto/customer.dto.js";
import type { CustomerRepository } from "../../../../application/ports/customer-repository.js";
import { toCents, toCurrencyNumberFromCents, toPhoneE164 } from "../../../../domain/customers/customer.js";

export class PrismaCustomerRepository implements CustomerRepository {
  async listWithOpenBalance() {
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

    return customers.map((customer) => ({
      id: customer.id,
      name: customer.name,
      phone: customer.phone,
      phoneE164: customer.phoneE164,
      address: customer.address,
      creditLimit: toCurrencyNumberFromCents(customer.creditLimitCents),
      notes: customer.notes,
      isActive: customer.isActive,
      openBalance: customer.sales.reduce((total, sale) => total + sale.remainingAmountCents, 0) / 100,
      createdAt: customer.createdAt
    }));
  }

  async create(input: CreateCustomerInput) {
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

  async update(id: string, input: UpdateCustomerInput) {
    const customer = await prisma.customer.update({
      where: { id },
      data: {
        ...(input.name !== undefined ? { name: input.name } : {}),
        ...(input.phone !== undefined ? { phone: input.phone, phoneE164: toPhoneE164(input.phone) } : {}),
        ...(input.address !== undefined ? { address: input.address } : {}),
        ...(input.creditLimit !== undefined ? { creditLimitCents: toCents(input.creditLimit) } : {}),
        ...(input.notes !== undefined ? { notes: input.notes } : {}),
        ...(input.isActive !== undefined ? { isActive: input.isActive } : {})
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
}
