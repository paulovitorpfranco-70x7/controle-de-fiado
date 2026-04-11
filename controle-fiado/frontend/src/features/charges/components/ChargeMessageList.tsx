import { useState } from "react";
import { retryFailedCharge } from "../api/retry-failed-charge";
import type { ChargeMessage } from "../types/charge-message";

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
