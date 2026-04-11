import { prisma } from "../../../../lib/prisma.js";
import type { SaleBalanceRepository } from "../../../../application/ports/sale-balance-repository.js";

export class PrismaSaleBalanceRepository implements SaleBalanceRepository {
  async listOpenBalancesByCustomer(customerId: string) {
    const sales = await prisma.sale.findMany({
      where: {
        customerId,
        status: {
          in: ["OPEN", "PARTIAL", "OVERDUE"]
        },
        remainingAmountCents: {
          gt: 0
        }
      },
      orderBy: [{ saleDate: "asc" }, { createdAt: "asc" }],
      select: {
        id: true,
        remainingAmountCents: true
      }
    });

    return sales.map((sale) => ({
      saleId: sale.id,
      remainingAmount: sale.remainingAmountCents / 100
    }));
  }
}
