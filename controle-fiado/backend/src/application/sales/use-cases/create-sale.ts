import { calculateSaleAmounts, resolveSaleStatus } from "../../../domain/sales/sale.js";
import type { AuditLogService } from "../../ports/audit-log-service.js";
import type { SaleRepository } from "../../ports/sale-repository.js";
import type { CreateSaleInput } from "../dto/create-sale.dto.js";

export class CreateSaleUseCase {
  constructor(
    private readonly saleRepository: SaleRepository,
    private readonly auditLogService: AuditLogService
  ) {}

  async execute(input: CreateSaleInput) {
    const amounts = calculateSaleAmounts({
      originalAmount: input.originalAmount,
      feeAmount: input.feeAmount,
      feePercent: input.feePercent
    });

    const sale = await this.saleRepository.create({
      ...input,
      originalAmount: amounts.originalAmount,
      feeAmount: amounts.feeAmount
    });

    await this.auditLogService.register({
      action: "sale_created",
      entityType: "sale",
      entityId: sale.id,
      actorUserId: input.createdById,
      payload: {
        customerId: sale.customerId,
        finalAmount: sale.finalAmount,
        dueDate: sale.dueDate.toISOString(),
        status: resolveSaleStatus({
          remainingAmount: sale.remainingAmount,
          dueDate: sale.dueDate
        })
      }
    });

    return sale;
  }
}
