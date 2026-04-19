import { X } from "lucide-react";
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
  onCancel?: () => void;
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
  onSuccess,
  onCancel
}: ManualChargeFormProps) {
  const [messageBody, setMessageBody] = useState(buildDefaultMessage(customerName, openBalance));
  const [loading, setLoading] = useState(false);
  const [isEditingMessage, setIsEditingMessage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasWhatsAppTarget = Boolean(customerPhoneE164);

  useEffect(() => {
    setMessageBody(buildDefaultMessage(customerName, openBalance));
    setIsEditingMessage(false);
    setError(null);
  }, [customerName, openBalance]);

  async function handleOpenWhatsApp() {
    if (!customerPhoneE164) {
      setError("Cliente sem telefone valido para abrir o WhatsApp.");
      return;
    }

    const whatsappWindow = window.open("", "_blank", "noopener,noreferrer");
    setLoading(true);
    setError(null);

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

      const finalMessage = message.phoneE164 ? message.messageBody : messageBody;
      const finalPhone = message.phoneE164 ?? customerPhoneE164;
      const whatsappUrl = buildWhatsAppUrl(finalPhone, finalMessage);

      if (whatsappWindow) {
        whatsappWindow.location.href = whatsappUrl;
      } else {
        window.open(whatsappUrl, "_blank", "noopener,noreferrer");
      }

      onSuccess?.("Mensagem aberta no WhatsApp.");
      await onSent();
    } catch (err) {
      whatsappWindow?.close();
      setError(err instanceof Error ? err.message : "Falha ao preparar cobranca.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="dashboard-chart-card manual-charge-card">
      <div className="dashboard-card-head">
        <div>
          <div className="eyebrow">Cobranca manual</div>
          <h3 id="manual-charge-title">Enviar mensagem</h3>
          <p className="page-description">Confira o texto e abra a conversa no WhatsApp. Edite apenas se precisar ajustar.</p>
        </div>
        {onCancel ? (
          <button className="floating-form-close" type="button" aria-label="Fechar cobranca manual" onClick={onCancel}>
            <X size={18} strokeWidth={2.2} />
          </button>
        ) : (
          <span className={`customer-tag ${hasWhatsAppTarget ? "success" : "warning"}`}>{hasWhatsAppTarget ? "WhatsApp pronto" : "Sem WhatsApp"}</span>
        )}
      </div>

      {onCancel ? <span className={`customer-tag ${hasWhatsAppTarget ? "success" : "warning"}`}>{hasWhatsAppTarget ? "WhatsApp pronto" : "Sem WhatsApp"}</span> : null}

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
      </div>

      {!hasWhatsAppTarget ? <div className="operation-notice error">Cliente sem telefone valido para abrir o WhatsApp.</div> : null}

      {isEditingMessage ? (
        <label className="field-block" htmlFor="manual-charge-message">
          <span className="label">Mensagem</span>
          <textarea
            id="manual-charge-message"
            className="message-textarea"
            value={messageBody}
            onChange={(event) => setMessageBody(event.target.value)}
          />
        </label>
      ) : (
        <div className="charge-preview-card">
          <span className="label">Mensagem</span>
          <strong>{customerName}</strong>
          <p className="message-copy">{messageBody}</p>
        </div>
      )}

      <div className="form-actions-row">
        <button className="auth-button compact-action-button" type="button" onClick={handleOpenWhatsApp} disabled={loading || !hasWhatsAppTarget}>
          {loading ? "Abrindo..." : "Abrir no WhatsApp"}
        </button>
        <button className="ghost-button compact-action-button" type="button" onClick={() => setIsEditingMessage((current) => !current)}>
          {isEditingMessage ? "Concluir edicao" : "Editar mensagem"}
        </button>
      </div>

      {error ? <div className="operation-notice error">{error}</div> : null}
    </div>
  );
}
