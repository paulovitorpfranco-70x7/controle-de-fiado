import { prisma } from "../../../../lib/prisma.js";
import type { ChargeOverviewRepository } from "../../../../application/ports/charge-overview-repository.js";

function startOfDay(date: Date) {
  const value = new Date(date);
  value.setHours(0, 0, 0, 0);
  return value;
}

function endOfDay(date: Date) {
  const value = new Date(date);
  value.setHours(23, 59, 59, 999);
  return value;
}

function addDays(date: Date, amount: number) {
  const value = new Date(date);
  value.setDate(value.getDate() + amount);
  return value;
}

export class PrismaChargeOverviewRepository implements ChargeOverviewRepository {
  async listDueSoon(referenceDate: Date) {
    return this.listByDueWindow(startOfDay(addDays(referenceDate, 3)), endOfDay(addDays(referenceDate, 3)));
  }

  async listDueToday(referenceDate: Date) {
    return this.listByDueWindow(startOfDay(referenceDate), endOfDay(referenceDate));
  }

  async listOverdue(referenceDate: Date) {
    const sales = await prisma.sale.findMany({
      where: {
        status: {
          in: ["OPEN", "PARTIAL", "OVERDUE"]
        },
        remainingAmountCents: {
          gt: 0
        },
        dueDate: {
          lt: startOfDay(referenceDate)
        }
      },
      include: {
        customer: true
      },
      orderBy: [{ dueDate: "asc" }]
    });

    return sales.map(mapChargeOverview);
  }

  async findCustomerChargeContext(customerId: string, saleId?: string) {
    const sale = await prisma.sale.findFirst({
      where: {
        customerId,
        ...(saleId ? { id: saleId } : {}),
        status: {
          in: ["OPEN", "PARTIAL", "OVERDUE"]
        },
        remainingAmountCents: {
          gt: 0
        }
      },
      include: {
        customer: true
      },
      orderBy: [{ dueDate: "asc" }, { saleDate: "asc" }]
    });

    if (!sale) {
      return null;
    }

    return mapChargeOverview(sale);
  }

  private async listByDueWindow(from: Date, to: Date) {
    const sales = await prisma.sale.findMany({
      where: {
        status: {
          in: ["OPEN", "PARTIAL", "OVERDUE"]
        },
        remainingAmountCents: {
          gt: 0
        },
        dueDate: {
          gte: from,
          lte: to
        }
      },
      include: {
        customer: true
      },
      orderBy: [{ dueDate: "asc" }]
    });

    return sales.map(mapChargeOverview);
  }
}

function mapChargeOverview(sale: {
  id: string;
  dueDate: Date;
  remainingAmountCents: number;
  status: string;
  customer: {
    id: string;
    name: string;
    phone: string;
    phoneE164: string | null;
  };
}) {
  return {
    customerId: sale.customer.id,
    customerName: sale.customer.name,
    phone: sale.customer.phone,
    phoneE164: sale.customer.phoneE164,
    saleId: sale.id,
    dueDate: sale.dueDate,
    remainingAmount: sale.remainingAmountCents / 100,
    status: sale.status as "OPEN" | "PARTIAL" | "OVERDUE"
  };
}
