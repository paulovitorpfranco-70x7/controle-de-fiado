import type { CreateCustomerInput } from "../dto/customer.dto.js";
import type { AuditLogService } from "../../ports/audit-log-service.js";
import type { CustomerRepository } from "../../ports/customer-repository.js";

export class CreateCustomerUseCase {
  constructor(
    private readonly customerRepository: CustomerRepository,
    private readonly auditLogService: AuditLogService
  ) {}

  async execute(input: CreateCustomerInput) {
    const customer = await this.customerRepository.create(input);

    await this.auditLogService.register({
      action: "customer_created",
      entityType: "customer",
      entityId: customer.id,
      payload: {
        name: customer.name,
        phone: customer.phone
      }
    });

    return customer;
  }
}
