import { prisma } from "../../../../lib/prisma.js";
import type { DashboardRepository } from "../../../../application/ports/dashboard-repository.js";

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

export class PrismaDashboardRepository implements DashboardRepository {
  async getSummary(referenceDate = new Date()) {
    const todayStart = startOfDay(referenceDate);
    const todayEnd = endOfDay(referenceDate);
    const dueSoonStart = startOfDay(addDays(referenceDate, 1));
    const dueSoonEnd = endOfDay(addDays(referenceDate, 3));
    const monthStart = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), 1);

    const [openSales, dueTodaySales, dueSoonSales, recentPayments, recentSales, customerBalances] = await Promise.all([
      prisma.sale.findMany({
        where: {
          status: { in: ["OPEN", "PARTIAL", "OVERDUE"] },
          remainingAmountCents: { gt: 0 }
        },
        select: {
          customerId: true,
          remainingAmountCents: true,
          customer: {
            select: {
              name: true,
              phone: true
            }
          }
        }
      }),
      prisma.sale.findMany({
        where: {
          status: { in: ["OPEN", "PARTIAL", "OVERDUE"] },
          remainingAmountCents: { gt: 0 },
          dueDate: { gte: todayStart, lte: todayEnd }
        },
        select: { id: true }
      }),
      prisma.sale.findMany({
        where: {
          status: { in: ["OPEN", "PARTIAL", "OVERDUE"] },
          remainingAmountCents: { gt: 0 },
          dueDate: { gte: dueSoonStart, lte: dueSoonEnd }
        },
        select: { id: true }
      }),
      prisma.payment.aggregate({
        where: {
          paymentDate: { gte: monthStart }
        },
        _sum: {
          amountCents: true
        }
      }),
      prisma.sale.aggregate({
        where: {
          saleDate: { gte: monthStart }
        },
        _sum: {
          finalAmountCents: true
        }
      }),
      prisma.customer.findMany({
        include: {
          sales: {
            where: {
              status: { in: ["OPEN", "PARTIAL", "OVERDUE"] },
              remainingAmountCents: { gt: 0 }
            },
            select: {
              remainingAmountCents: true
            }
          }
        }
      })
    ]);

    const totalOpenBalance = openSales.reduce((total, sale) => total + sale.remainingAmountCents, 0) / 100;

    const topDebtors = customerBalances
      .map((customer) => ({
        customerId: customer.id,
        customerName: customer.name,
        phone: customer.phone,
        openBalance: customer.sales.reduce((total, sale) => total + sale.remainingAmountCents, 0) / 100
      }))
      .filter((customer) => customer.openBalance > 0)
      .sort((left, right) => right.openBalance - left.openBalance)
      .slice(0, 5);

    return {
      totalOpenBalance,
      overdueCustomers: new Set(
        (
          await prisma.sale.findMany({
            where: {
              status: "OVERDUE",
              remainingAmountCents: { gt: 0 }
            },
            select: {
              customerId: true
            }
          })
        ).map((sale) => sale.customerId)
      ).size,
      dueTodayCount: dueTodaySales.length,
      dueSoonCount: dueSoonSales.length,
      recentPaymentsTotal: (recentPayments._sum.amountCents ?? 0) / 100,
      recentSalesTotal: (recentSales._sum.finalAmountCents ?? 0) / 100,
      topDebtors
    };
  }
}
