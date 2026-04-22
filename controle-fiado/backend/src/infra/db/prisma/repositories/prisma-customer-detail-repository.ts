import type { CustomerDetailRepository } from "../../../../application/ports/customer-detail-repository.js";
import { parseSaleDescription } from "../../../../application/sales/utils/sale-items.js";
import { toCurrencyNumberFromCents } from "../../../../domain/customers/customer.js";
import type { PaymentMethod } from "../../../../domain/payments/payment.js";
import type { SaleStatus } from "../../../../domain/sales/sale.js";
import { prisma } from "../../../../lib/prisma.js";

function toMoneyFromCents(value: number) {
  return value / 100;
}

export class PrismaCustomerDetailRepository implements CustomerDetailRepository {
  async findById(id: string) {
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        sales: {
          orderBy: [{ saleDate: "desc" }, { createdAt: "desc" }]
        },
        payments: {
          orderBy: [{ paymentDate: "desc" }, { createdAt: "desc" }],
          include: {
            allocations: true
          }
        }
      }
    });

    if (!customer) {
      return null;
    }

    return mapCustomerDetail(customer);
  }
}

export function mapCustomerDetail(customer: {
  id: string;
  name: string;
  phone: string;
  phoneE164: string | null;
  address: string | null;
  creditLimitCents: number | null;
  notes: string | null;
  isActive: boolean;
  createdAt: Date;
  sales: Array<{
    id: string;
    customerId: string;
    description: string;
    originalAmountCents: number;
    feeAmountCents: number;
    finalAmountCents: number;
    remainingAmountCents: number;
    saleDate: Date;
    dueDate: Date;
    status: SaleStatus;
    createdById: string;
    createdAt: Date;
  }>;
  payments: Array<{
    id: string;
    customerId: string;
    amountCents: number;
    paymentDate: Date;
    method: PaymentMethod;
    notes: string | null;
    createdById: string;
    createdAt: Date;
    allocations: Array<{
      saleId: string;
      amountCents: number;
    }>;
  }>;
}) {
  const sales = customer.sales.map((sale) => {
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
  });

  const payments = customer.payments.map((payment) => ({
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
  }));

  return {
    id: customer.id,
    name: customer.name,
    phone: customer.phone,
    phoneE164: customer.phoneE164,
    address: customer.address,
    creditLimit: toCurrencyNumberFromCents(customer.creditLimitCents),
    notes: customer.notes,
    isActive: customer.isActive,
    createdAt: customer.createdAt,
    openBalance: sales
      .filter((sale) => ["OPEN", "PARTIAL", "OVERDUE"].includes(sale.status))
      .reduce((total, sale) => total + sale.remainingAmount, 0),
    sales,
    payments
  };
}
