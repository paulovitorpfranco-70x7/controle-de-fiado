import { allocatePaymentOldestFirst } from "../../../domain/payments/payment-allocation.js";
import type { AuditLogService } from "../../ports/audit-log-service.js";
import type { PaymentRepository } from "../../ports/payment-repository.js";
import type { SaleBalanceRepository } from "../../ports/sale-balance-repository.js";
import type { CreatePaymentInput } from "../dto/create-payment.dto.js";

export class CreatePaymentUseCase {
  constructor(
    private readonly saleBalanceRepository: SaleBalanceRepository,
    private readonly paymentRepository: PaymentRepository,
    private readonly auditLogService: AuditLogService
  ) {}

  async execute(input: CreatePaymentInput) {
    const openSales = await this.saleBalanceRepository.listOpenBalancesByCustomer(input.customerId);

    const allocationResult = allocatePaymentOldestFirst({
      paymentAmount: input.amount,
      openSales
    });

    const payment = await this.paymentRepository.createWithAllocations(input, allocationResult.allocations);

    await this.auditLogService.register({
      action: "payment_created",
      entityType: "payment",
      entityId: payment.id,
      actorUserId: input.createdById,
      payload: {
        customerId: payment.customerId,
        allocations: payment.allocations,
        unallocatedAmount: allocationResult.unallocatedAmount
      }
    });

    return payment;
  }
}
