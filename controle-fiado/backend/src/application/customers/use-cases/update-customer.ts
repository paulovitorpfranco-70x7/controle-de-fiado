import type { UpdateCustomerInput } from "../dto/customer.dto.js";
import type { AuditLogService } from "../../ports/audit-log-service.js";
import type { CustomerRepository } from "../../ports/customer-repository.js";

export class UpdateCustomerUseCase {
  constructor(
    private readonly customerRepository: CustomerRepository,
    private readonly auditLogService: AuditLogService
  ) {}

  async execute(id: string, input: UpdateCustomerInput) {
    const customer = await this.customerRepository.update(id, input);

    await this.auditLogService.register({
      action: "customer_updated",
      entityType: "customer",
      entityId: customer.id,
      payload: input
    });

    return customer;
  }
}
