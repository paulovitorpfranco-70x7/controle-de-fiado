import type { ChargeMessage } from "../types/charge-message";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short"
  }).format(new Date(value));
}

type ChargeMessageListProps = {
  messages: ChargeMessage[];
};

export function ChargeMessageList({ messages }: ChargeMessageListProps) {
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
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
