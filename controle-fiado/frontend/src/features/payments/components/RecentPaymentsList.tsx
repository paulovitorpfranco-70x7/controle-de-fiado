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

type RecentPaymentsListProps = {
  payments: Payment[];
};

export function RecentPaymentsList({ payments }: RecentPaymentsListProps) {
  return (
    <section className="card-list">
      {payments.map((payment) => (
        <article key={payment.id} className="customer-card">
          <div className="customer-main">
            <div>
              <div className="customer-name">{formatMoney(payment.amount)}</div>
              <div className="customer-meta">
                Pagamento em {formatDate(payment.paymentDate)} · {payment.method}
              </div>
            </div>
            <div className="badge success">{payment.allocations.length} aloc.</div>
          </div>
          <div className="customer-grid">
            <div>
              <span className="label">Cliente</span>
              <strong>{payment.customerId}</strong>
            </div>
            <div>
              <span className="label">Rateado</span>
              <strong>{formatMoney(payment.allocations.reduce((total, item) => total + item.amount, 0))}</strong>
            </div>
            <div>
              <span className="label">Obs.</span>
              <strong>{payment.notes ?? "Sem observacao"}</strong>
            </div>
          </div>
        </article>
      ))}
    </section>
  );
}
