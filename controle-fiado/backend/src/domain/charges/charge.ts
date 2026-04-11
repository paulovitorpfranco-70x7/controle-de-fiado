export type ChargeTriggerType = "AUTO_3_DAYS" | "AUTO_DUE_DATE" | "MANUAL";
export type ChargeSendStatus = "PENDING" | "SENT" | "FAILED" | "CANCELED";

export type ChargeMessage = {
  id: string;
  customerId: string;
  saleId: string | null;
  triggerType: ChargeTriggerType;
  messageBody: string;
  sendStatus: ChargeSendStatus;
  providerName: string | null;
  providerMessageId: string | null;
  providerResponse: string | null;
  scheduledFor: Date | null;
  sentAt: Date | null;
  createdById: string | null;
  createdAt: Date;
};

export function buildManualChargeMessage(input: {
  customerName: string;
  merchantName: string;
  openBalance: number;
  dueDate?: Date | null;
}) {
  const balance = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  }).format(input.openBalance);

  const dueDate = input.dueDate
    ? new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" }).format(input.dueDate)
    : null;

  const dueText = dueDate ? ` com vencimento em ${dueDate}` : "";

  return `Ola ${input.customerName}, seu saldo em aberto no ${input.merchantName} e de ${balance}${dueText}. Responda esta mensagem para combinar o pagamento.`;
}
