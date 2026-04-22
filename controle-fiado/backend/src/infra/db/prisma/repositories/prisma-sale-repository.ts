import type { CreateSaleInput } from "../../../../application/sales/dto/create-sale.dto.js";
import { parseSaleDescription } from "../../../../application/sales/utils/sale-items.js";
import { calculateSaleAmounts, resolveSaleStatus } from "../../../../domain/sales/sale.js";
import { prisma } from "../../../../lib/prisma.js";
import type { SaleRepository } from "../../../../application/ports/sale-repository.js";

function toMoneyFromCents(value: number) {
  return value / 100;
}

function toCents(value: number) {
  return Math.round(value * 100);
}

export class PrismaSaleRepository implements SaleRepository {
  async list() {
    const sales = await prisma.sale.findMany({
      orderBy: [{ saleDate: "desc" }, { createdAt: "desc" }]
    });

    return sales.map(mapSale);
  }

  async listByCustomer(customerId: string) {
    const sales = await prisma.sale.findMany({
      where: { customerId },
      orderBy: [{ saleDate: "desc" }, { createdAt: "desc" }]
    });

    return sales.map(mapSale);
  }

  async create(input: CreateSaleInput) {
    const amounts = calculateSaleAmounts({
      originalAmount: input.originalAmount,
      feeAmount: input.feeAmount,
      feePercent: input.feePercent
    });

    const remainingAmount = amounts.finalAmount;
    const status = resolveSaleStatus({
      remainingAmount,
      dueDate: input.dueDate
    });

    const sale = await prisma.sale.create({
      data: {
        customerId: input.customerId,
        description: input.description,
        originalAmountCents: toCents(amounts.originalAmount),
        feeAmountCents: toCents(amounts.feeAmount),
        finalAmountCents: toCents(amounts.finalAmount),
        remainingAmountCents: toCents(remainingAmount),
        saleDate: input.saleDate,
        dueDate: input.dueDate,
        status,
        createdById: input.createdById
      }
    });

    return mapSale(sale);
  }
}

function mapSale(sale: {
  id: string;
  customerId: string;
  description: string;
  originalAmountCents: number;
  feeAmountCents: number;
  finalAmountCents: number;
  remainingAmountCents: number;
  saleDate: Date;
  dueDate: Date;
  status: "OPEN" | "PARTIAL" | "PAID" | "OVERDUE" | "CANCELED";
  createdById: string;
  createdAt: Date;
}) {
  const parsedDescription = parseSaleDescription(sale.description);

  return {
    id: sale.id,
    customerId: sale.customerId,
    description: parsedDescription.description,
    saleItems: parsedDescription.saleItems,
    originalAmount: toMoneyFromCents(sale.originalAmountCents),
    feeAmount: toMoneyFromCents(sale.feeAmountCents),
    finalAmount: toMoneyFromCents(sale.finalAmountCents),
    remainingAmount: toMoneyFromCents(sale.remainingAmountCents),
    saleDate: sale.saleDate,
    dueDate: sale.dueDate,
    status: sale.status,
    createdById: sale.createdById,
    createdAt: sale.createdAt
  };
}
