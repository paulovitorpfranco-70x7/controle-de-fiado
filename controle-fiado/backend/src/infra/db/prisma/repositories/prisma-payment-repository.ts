import { Prisma, SaleStatus } from "@prisma/client";
import { prisma } from "../../../../lib/prisma.js";
import type { PaymentRepository } from "../../../../application/ports/payment-repository.js";
import type { CreatePaymentInput } from "../../../../application/payments/dto/create-payment.dto.js";
import type { PaymentAllocationResult } from "../../../../domain/payments/payment-allocation.js";
import type { PaymentMethod } from "../../../../domain/payments/payment.js";

function toMoneyFromCents(value: number) {
  return value / 100;
}

function toCents(value: number) {
  return Math.round(value * 100);
}

export class PrismaPaymentRepository implements PaymentRepository {
  async list() {
    const payments = await prisma.payment.findMany({
      orderBy: [{ paymentDate: "desc" }, { createdAt: "desc" }],
      include: {
        allocations: true
      }
    });

    return payments.map(mapPayment);
  }

  async listByCustomer(customerId: string) {
    const payments = await prisma.payment.findMany({
      where: { customerId },
      orderBy: [{ paymentDate: "desc" }, { createdAt: "desc" }],
      include: {
        allocations: true
      }
    });

    return payments.map(mapPayment);
  }

  async createWithAllocations(input: CreatePaymentInput, allocations: PaymentAllocationResult[]) {
    const payment = await prisma.$transaction(async (tx) => {
      const createdPayment = await tx.payment.create({
        data: {
          customerId: input.customerId,
          amountCents: toCents(input.amount),
          paymentDate: input.paymentDate,
          method: input.method as PaymentMethod,
          notes: input.notes,
          createdById: input.createdById
        }
      });

      for (const allocation of allocations) {
        await tx.paymentAllocation.create({
          data: {
            paymentId: createdPayment.id,
            saleId: allocation.saleId,
            amountCents: toCents(allocation.amount)
          }
        });

        const sale = await tx.sale.findUniqueOrThrow({
          where: { id: allocation.saleId },
          select: {
            remainingAmountCents: true,
            dueDate: true
          }
        });

        const nextRemainingCents = Math.max(sale.remainingAmountCents - toCents(allocation.amount), 0);
        const nextStatus = resolveUpdatedSaleStatus(nextRemainingCents, sale.dueDate);

        await tx.sale.update({
          where: { id: allocation.saleId },
          data: {
            remainingAmountCents: nextRemainingCents,
            status: nextStatus
          }
        });
      }

      return tx.payment.findUniqueOrThrow({
        where: { id: createdPayment.id },
        include: {
          allocations: true
        }
      });
    });

    return mapPayment(payment);
  }
}

function resolveUpdatedSaleStatus(remainingAmountCents: number, dueDate: Date) {
  if (remainingAmountCents <= 0) return SaleStatus.PAID;
  if (dueDate.getTime() < Date.now()) return SaleStatus.OVERDUE;
  return SaleStatus.PARTIAL;
}

function mapPayment(payment: {
  id: string;
  customerId: string;
  amountCents: number;
  paymentDate: Date;
  method: PaymentMethod;
  notes: string | null;
  createdById: string;
  createdAt: Date;
  allocations: { saleId: string; amountCents: number }[];
}) {
  return {
    id: payment.id,
    customerId: payment.customerId,
    amount: toMoneyFromCents(payment.amountCents),
    paymentDate: payment.paymentDate,
    method: payment.method,
    notes: payment.notes,
    createdById: payment.createdById,
    createdAt: payment.createdAt,
    allocations: payment.allocations.map((allocation) => ({
      saleId: allocation.saleId,
      amount: toMoneyFromCents(allocation.amountCents)
    }))
  };
}
