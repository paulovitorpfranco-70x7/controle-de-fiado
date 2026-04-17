import { useEffect, useState } from "react";
import { markChargeMessageSent } from "../api/mark-charge-message-sent";
import { sendManualCharge } from "../api/send-manual-charge";
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

      setSuccess("Mensagem preparada com sucesso. Abra no WhatsApp para concluir o contato.");
      onSuccess?.("Mensagem preparada com sucesso.");
      await onSent();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao preparar cobranca.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="section-block">
      <form className="dashboard-chart-card manual-charge-card" onSubmit={handleSubmit}>
        <div className="dashboard-card-head">
          <div>
            <div className="eyebrow">Cobranca manual</div>
            <h3>Preparar mensagem</h3>
            <p className="page-description">Monte o texto final, confira o contato e abra a conversa com um clique.</p>
          </div>
        </div>

        <div className="operation-support-grid">
          <div className="support-card">
            <span className="label">Cliente</span>
            <strong>{customerName}</strong>
          </div>
          <div className="support-card">
            <span className="label">Saldo atual</span>
            <strong>{formatMoney(openBalance)}</strong>
          </div>
          <div className="support-card">
            <span className="label">WhatsApp</span>
            <strong>{customerPhoneE164 ?? customerPhone ?? "Nao informado"}</strong>
          </div>
          <div className="support-card">
            <span className="label">Venda alvo</span>
            <strong>{saleId ? saleId.slice(0, 8) : "Sem venda especifica"}</strong>
          </div>
        </div>

        {!hasWhatsAppTarget ? <div className="operation-notice error">Cliente sem telefone valido para abrir o WhatsApp.</div> : null}

        <label className="field-block" htmlFor="manual-charge-message">
          <span className="label">Mensagem</span>
          <textarea
            id="manual-charge-message"
            className="message-textarea"
            value={messageBody}
            onChange={(event) => setMessageBody(event.target.value)}
          />
        </label>

        <div className="form-actions-row">
          <button className="auth-button" type="submit" disabled={loading || !hasWhatsAppTarget}>
            {loading ? "Preparando..." : "Preparar cobranca"}
          </button>
          {whatsappUrl ? (
            <a className="ghost-button inline-link-button" href={whatsappUrl} target="_blank" rel="noreferrer">
              Abrir no WhatsApp
            </a>
          ) : null}
        </div>

        {success ? <div className="operation-notice success">{success}</div> : null}
        {error ? <div className="operation-notice error">{error}</div> : null}
      </form>
    </section>
  );
}
