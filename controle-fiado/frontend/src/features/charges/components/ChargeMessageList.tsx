import { useState } from "react";
import { markChargeMessageSent } from "../api/mark-charge-message-sent";
import { retryFailedCharge } from "../api/retry-failed-charge";
import type { ChargeMessage } from "../types/charge-message";
import { buildWhatsAppUrl } from "../utils/build-whatsapp-url";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short"
  }).format(new Date(value));
}

function getTriggerLabel(triggerType: string) {
  const labels: Record<string, string> = {
    AUTO_3_DAYS: "Aviso 3 dias",
    AUTO_DUE_DATE: "Aviso no vencimento",
    MANUAL: "Manual"
  };

  return labels[triggerType] ?? triggerType;
}

function getSendStatusLabel(status: string) {
  const labels: Record<string, string> = {
    PENDING: "Pendente",
    SENT: "Enviada",
    FAILED: "Falhou"
  };

  return labels[status] ?? status;
}

type ChargeMessageListProps = {
  messages: ChargeMessage[];
  canRetry: boolean;
  onRetried?: (message: string) => void;
  onCompleted: () => Promise<void> | void;
};

export function ChargeMessageList({ messages, canRetry, onRetried, onCompleted }: ChargeMessageListProps) {
  const [retryingId, setRetryingId] = useState<string | null>(null);
  const [markingId, setMarkingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleRetry(messageId: string) {
    setRetryingId(messageId);
    setError(null);

    try {
      await retryFailedCharge(messageId);
      onRetried?.("Mensagem com falha reenviada com sucesso.");
      await onCompleted();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao reenviar mensagem.");
    } finally {
      setRetryingId(null);
    }
  }

  async function handleOpenAndMark(message: ChargeMessage) {
    if (!message.phoneE164) {
      setError("Cliente sem telefone valido para abrir o WhatsApp.");
      return;
    }

    setMarkingId(message.id);
    setError(null);

    try {
      await markChargeMessageSent(message.id);
      onRetried?.("Mensagem marcada como enviada.");
      await onCompleted();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao marcar a mensagem como enviada.");
    } finally {
      setMarkingId(null);
    }
  }

  return (
    <section className="section-block">
      <div className="dashboard-chart-card">
        <div className="dashboard-card-head">
          <div>
            <div className="eyebrow">Historico</div>
            <h3>Mensagens recentes</h3>
            <p className="page-description">So o essencial: status, horario, mensagem e proxima acao.</p>
          </div>
        </div>

        <div className="customer-stream-list">
          {messages.map((message) => (
            <article
              key={message.id}
              className={`stream-card charge-message-card ${
                message.sendStatus === "FAILED" ? "failed" : message.sendStatus === "PENDING" ? "pending" : "sent"
              }`}
            >
              <div className="stream-card-head">
                <div className="stream-card-copy">
                  <div className="stream-kicker">Mensagem</div>
                  <div className="stream-title">{message.customerName ?? getTriggerLabel(message.triggerType)}</div>
                  <div className="customer-meta">{formatDate(message.createdAt)}</div>
                  <div className="customer-card-tags">
                    <span className="customer-tag">{getTriggerLabel(message.triggerType)}</span>
                    {message.saleId ? <span className="customer-tag">Venda {message.saleId.slice(0, 8)}</span> : null}
                    {message.providerName ? <span className="customer-tag">{message.providerName}</span> : null}
                  </div>
                </div>
                <div
                  className={
                    message.sendStatus === "FAILED"
                      ? "badge warning"
                      : message.sendStatus === "PENDING"
                        ? "badge warning"
                        : "badge success"
                  }
                >
                  {getSendStatusLabel(message.sendStatus)}
                </div>
              </div>

              <div className="message-copy charge-message-copy">{message.messageBody}</div>
              <div className="customer-meta">
                {message.phone ?? "Telefone nao informado"} | {message.sentAt ? `enviada ${formatDate(message.sentAt)}` : "aguardando envio"}
              </div>
              {message.providerResponse ? <div className="customer-meta charge-provider-note">{message.providerResponse}</div> : null}

              <div className="form-actions-row">
                {message.sendStatus === "PENDING" ? (
                  <>
                    {message.phoneE164 ? (
                      <a
                        className="ghost-button inline-link-button compact-action-button"
                        href={buildWhatsAppUrl(message.phoneE164, message.messageBody)}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Abrir no WhatsApp
                      </a>
                    ) : (
                      <span className="error-copy">Cliente sem telefone valido.</span>
                    )}
                    <button
                      className="ghost-button compact-action-button"
                      type="button"
                      onClick={() => handleOpenAndMark(message)}
                      disabled={markingId === message.id}
                    >
                      {markingId === message.id ? "Marcando..." : "Marcar como enviada"}
                    </button>
                  </>
                ) : null}
                {message.sendStatus === "FAILED" && canRetry ? (
                  <button
                    className="auth-button compact-action-button"
                    type="button"
                    onClick={() => handleRetry(message.id)}
                    disabled={retryingId === message.id}
                  >
                    {retryingId === message.id ? "Reenviando..." : "Reenviar"}
                  </button>
                ) : null}
              </div>
            </article>
          ))}
        </div>

        {error ? <div className="operation-notice error">{error}</div> : null}
      </div>
    </section>
  );
}
