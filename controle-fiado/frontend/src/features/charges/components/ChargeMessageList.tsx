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
      setError(err instanceof Error ? err.message : "Falha ao abrir a mensagem no WhatsApp.");
    } finally {
      setMarkingId(null);
    }
  }

  return (
    <section className="section-block">
      <div className="customer-card">
        <div className="page-header page-header-section">
          <div>
            <div className="eyebrow">Historico</div>
            <h2>Mensagens enviadas</h2>
          </div>
        </div>

        <div className="detail-column">
          {messages.map((message) => (
            <article key={message.id} className="statement-item">
              <div className="statement-main">
                <strong>{message.triggerType}</strong>
                <span>{message.sendStatus}</span>
              </div>
              <div className="customer-meta">{formatDate(message.createdAt)}</div>
              <div className="message-copy">{message.messageBody}</div>
              {message.providerResponse ? <div className="customer-meta">{message.providerResponse}</div> : null}
              {message.sendStatus === "PENDING" ? (
                <div className="queue-actions">
                  {message.phoneE164 ? (
                    <a className="auth-button inline-link-button" href={buildWhatsAppUrl(message.phoneE164, message.messageBody)} target="_blank" rel="noreferrer">
                      Abrir no WhatsApp
                    </a>
                  ) : (
                    <span className="error-copy">Cliente sem telefone valido.</span>
                  )}
                  <button
                    className="ghost-button"
                    type="button"
                    onClick={() => handleOpenAndMark(message)}
                    disabled={markingId === message.id}
                  >
                    {markingId === message.id ? "Marcando..." : "Marcar como enviada"}
                  </button>
                </div>
              ) : null}
              {message.sendStatus === "FAILED" && canRetry ? (
                <button
                  className="auth-button"
                  type="button"
                  onClick={() => handleRetry(message.id)}
                  disabled={retryingId === message.id}
                >
                  {retryingId === message.id ? "Reenviando..." : "Reenviar"}
                </button>
              ) : null}
            </article>
          ))}
        </div>

        {error ? <div className="error-copy">{error}</div> : null}
      </div>
    </section>
  );
}
