import type { Customer } from "../../../domain/customers/customer.js";
import type { Payment } from "../../../domain/payments/payment.js";
import type { Sale } from "../../../domain/sales/sale.js";

export type CustomerDetail = Customer & {
  openBalance: number;
  sales: Sale[];
  payments: Payment[];
};
