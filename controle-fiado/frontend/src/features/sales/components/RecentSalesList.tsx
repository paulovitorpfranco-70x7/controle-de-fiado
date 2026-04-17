import type { Sale } from "../types/sale";

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

function getSaleStatusLabel(status: string) {
  const labels: Record<string, string> = {
    OPEN: "Em aberto",
    PARTIAL: "Parcial",
    OVERDUE: "Em atraso",
    PAID: "Pago"
  };

  return labels[status] ?? status;
}

type RecentSalesListProps = {
  sales: Sale[];
};

export function RecentSalesList({ sales }: RecentSalesListProps) {
  if (!sales.length) {
    return <div className="empty-card">Nenhuma venda recente encontrada.</div>;
  }

  return (
    <section className="dashboard-stream-list">
      {sales.map((sale) => {
        const paidAmount = Math.max(sale.finalAmount - sale.remainingAmount, 0);
        const progress = sale.finalAmount > 0 ? Math.min((paidAmount / sale.finalAmount) * 100, 100) : 0;

        return (
          <article key={sale.id} className="stream-card sale-stream-card">
            <div className="stream-card-head">
              <div className="stream-card-copy">
                <div className="stream-kicker">Venda</div>
                <div className="stream-title">{sale.description}</div>
                <div className="customer-meta">
                  {formatDate(sale.saleDate)} | vence em {formatDate(sale.dueDate)}
                </div>
              </div>
              <div className={sale.status === "OVERDUE" ? "badge warning" : "badge success"}>{getSaleStatusLabel(sale.status)}</div>
            </div>

            <div className="stream-progress">
              <div className="stream-progress-bar">
                <span className="stream-progress-fill sales" style={{ width: `${Math.max(progress, 6)}%` }} />
              </div>
              <div className="stream-progress-meta">
                <span>{formatMoney(paidAmount)} pago</span>
                <span>{formatMoney(sale.remainingAmount)} em aberto</span>
              </div>
            </div>

            <div className="stream-metrics-grid">
              <div>
                <span className="label">Valor final</span>
                <strong>{formatMoney(sale.finalAmount)}</strong>
              </div>
              <div>
                <span className="label">Acrescimo</span>
                <strong>{formatMoney(sale.feeAmount)}</strong>
              </div>
              <div>
                <span className="label">Origem</span>
                <strong>{sale.id.slice(0, 8)}</strong>
              </div>
            </div>
          </article>
        );
      })}
    </section>
  );
}
