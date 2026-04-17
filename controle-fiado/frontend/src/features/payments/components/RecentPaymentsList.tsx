import type { Payment } from "../types/payment";

function formatMoney(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  }).format(value);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short"
  }).format(new Date(value));
}

function getMethodLabel(method: Payment["method"]) {
  const labels: Record<Payment["method"], string> = {
    PIX: "PIX",
    CASH: "Dinheiro",
    CARD: "Cartao"
  };

  return labels[method];
}

type RecentPaymentsListProps = {
  payments: Payment[];
};

export function RecentPaymentsList({ payments }: RecentPaymentsListProps) {
  if (!payments.length) {
    return <div className="empty-card">Nenhum pagamento recente encontrado.</div>;
  }

  return (
    <section className="dashboard-stream-list">
      {payments.map((payment) => {
        const allocatedAmount = payment.allocations.reduce((total, item) => total + item.amount, 0);
        const progress = payment.amount > 0 ? Math.min((allocatedAmount / payment.amount) * 100, 100) : 0;

        return (
          <article key={payment.id} className="stream-card payment-stream-card">
            <div className="stream-card-head">
              <div className="stream-card-copy">
                <div className="stream-kicker">Pagamento</div>
                <div className="stream-title">{formatMoney(payment.amount)}</div>
                <div className="customer-meta">
                  {formatDate(payment.paymentDate)} | {getMethodLabel(payment.method)}
                </div>
              </div>
              <div className="badge success">{payment.allocations.length} aloc.</div>
            </div>

            <div className="stream-progress">
              <div className="stream-progress-bar">
                <span className="stream-progress-fill payments" style={{ width: `${Math.max(progress, 6)}%` }} />
              </div>
              <div className="stream-progress-meta">
                <span>{formatMoney(allocatedAmount)} alocado</span>
                <span>{formatMoney(Math.max(payment.amount - allocatedAmount, 0))} livre</span>
              </div>
            </div>

            <div className="stream-metrics-grid">
              <div>
                <span className="label">Referencia</span>
                <strong>{payment.id.slice(0, 8)}</strong>
              </div>
              <div>
                <span className="label">Metodo</span>
                <strong>{getMethodLabel(payment.method)}</strong>
              </div>
              <div>
                <span className="label">Observacao</span>
                <strong>{payment.notes ?? "Sem observacao"}</strong>
              </div>
            </div>
          </article>
        );
      })}
    </section>
  );
}
