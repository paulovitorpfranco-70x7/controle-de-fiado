import { useEffect, useState } from "react";
import { sendManualCharge } from "../api/send-manual-charge";
import { markChargeMessageSent } from "../api/mark-charge-message-sent";
import { buildWhatsAppUrl } from "../utils/build-whatsapp-url";

type ManualChargeFormProps = {
  customerId: string;
  customerName: string;
  saleId?: string;
  openBalance: number;
  createdById: string;
  onSent: () => Promise<void> | void;
  onSuccess?: (message: string) => void;
};

function formatMoney(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  }).format(value);
}

function buildDefaultMessage(customerName: string, openBalance: number) {
  return `Ola ${customerName}, seu saldo em aberto no Mercadinho do Tonhao e de ${formatMoney(openBalance)}. Responda esta mensagem para combinar o pagamento.`;
}

export function ManualChargeForm({
  customerId,
  customerName,
  saleId,
  openBalance,
  createdById,
  onSent,
  onSuccess
}: ManualChargeFormProps) {
  const [messageBody, setMessageBody] = useState(buildDefaultMessage(customerName, openBalance));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    setMessageBody(buildDefaultMessage(customerName, openBalance));
    setSuccess(null);
    setError(null);
  }, [customerName, openBalance]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const message = await sendManualCharge({
        customerId,
        saleId,
        messageBody,
        createdById
      });

      if (message.phoneE164) {
        window.open(buildWhatsAppUrl(message.phoneE164, message.messageBody), "_blank", "noopener,noreferrer");
      }

      if (message.sendStatus === "PENDING") {
        await markChargeMessageSent(message.id);
      }

      setSuccess("Mensagem preparada e aberta no WhatsApp.");
      onSuccess?.("Mensagem preparada e aberta no WhatsApp.");
      await onSent();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao enviar cobranca.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="section-block">
      <form className="customer-card manual-charge-form" onSubmit={handleSubmit}>
        <div className="page-header page-header-section">
          <div>
            <div className="eyebrow">Cobranca manual</div>
            <h2>Enviar mensagem agora</h2>
          </div>
        </div>

        <div className="customer-meta">Cliente selecionado: {customerName}</div>
        <div className="customer-meta">Saldo atual: {formatMoney(openBalance)}</div>

        <label className="eyebrow" htmlFor="manual-charge-message">
          Preview da mensagem
        </label>
        <textarea
          id="manual-charge-message"
          className="message-textarea"
          value={messageBody}
          onChange={(event) => setMessageBody(event.target.value)}
        />

        <button className="auth-button" type="submit" disabled={loading}>
          {loading ? "Preparando..." : "Abrir cobranca no WhatsApp"}
        </button>

        {success ? <div className="success-copy">{success}</div> : null}
        {error ? <div className="error-copy">{error}</div> : null}
      </form>
    </section>
  );
}
