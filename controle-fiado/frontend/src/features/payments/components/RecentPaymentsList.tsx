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
    <section className="dashboard-stream-list dashboard-stream-list-compact">
      {payments.slice(0, 3).map((payment) => {
        const allocatedAmount = payment.allocations.reduce((total, item) => total + item.amount, 0);
        const progress = payment.amount > 0 ? Math.min((allocatedAmount / payment.amount) * 100, 100) : 0;

        return (
          <article key={payment.id} className="compact-stream-card payment-stream-card">
            <div className="compact-stream-head">
              <div className="compact-stream-copy">
                <div className="compact-stream-title-row">
                  <strong className="compact-stream-title">{formatDate(payment.paymentDate)} | {getMethodLabel(payment.method)}</strong>
                  <div className="badge success">{payment.allocations.length} aloc.</div>
                </div>
                <div className="customer-meta">{payment.notes ?? "Sem observacao"}</div>
              </div>
              <strong className="compact-stream-amount">{formatMoney(payment.amount)}</strong>
            </div>

            <div className="compact-stream-progress">
              <div className="stream-progress-bar compact-progress-bar">
                <span className="stream-progress-fill payments" style={{ width: `${Math.max(progress, 6)}%` }} />
              </div>
              <div className="compact-stream-meta">
                <span>{formatMoney(allocatedAmount)} alocado</span>
                <span>{formatMoney(Math.max(payment.amount - allocatedAmount, 0))} livre</span>
                <span>{payment.id.slice(0, 8)}</span>
              </div>
            </div>
          </article>
        );
      })}
    </section>
  );
}
