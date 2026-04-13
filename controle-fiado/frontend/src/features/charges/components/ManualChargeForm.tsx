import { useEffect, useState } from "react";
import { sendManualCharge } from "../api/send-manual-charge";
import { markChargeMessageSent } from "../api/mark-charge-message-sent";
import { buildWhatsAppUrl } from "../utils/build-whatsapp-url";

type ManualChargeFormProps = {
  customerId: string;
  customerName: string;
  customerPhone?: string | null;
  customerPhoneE164?: string | null;
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
  customerPhone,
  customerPhoneE164,
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
  const hasWhatsAppTarget = Boolean(customerPhoneE164);
  const whatsappUrl = customerPhoneE164 ? buildWhatsAppUrl(customerPhoneE164, messageBody) : null;

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
        setMessageBody(message.messageBody);
      }

      if (message.sendStatus === "PENDING") {
        await markChargeMessageSent(message.id);
      }

      setSuccess("Mensagem preparada com sucesso. Use o botao abaixo para abrir no WhatsApp.");
      onSuccess?.("Mensagem preparada com sucesso.");
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
        <div className="customer-meta">WhatsApp: {customerPhoneE164 ?? customerPhone ?? "Nao informado"}</div>
        {!hasWhatsAppTarget ? (
          <div className="error-copy">Cliente sem telefone valido para abrir o WhatsApp. Ajuste o telefone antes de cobrar.</div>
        ) : null}

        <label className="eyebrow" htmlFor="manual-charge-message">
          Preview da mensagem
        </label>
        <textarea
          id="manual-charge-message"
          className="message-textarea"
          value={messageBody}
          onChange={(event) => setMessageBody(event.target.value)}
        />

        <button className="auth-button" type="submit" disabled={loading || !hasWhatsAppTarget}>
          {loading ? "Preparando..." : "Preparar cobranca"}
        </button>
        {whatsappUrl ? (
          <a className="auth-button inline-link-button" href={whatsappUrl} target="_blank" rel="noreferrer">
            Abrir no WhatsApp
          </a>
        ) : null}

        {success ? <div className="success-copy">{success}</div> : null}
        {error ? <div className="error-copy">{error}</div> : null}
      </form>
    </section>
  );
}
