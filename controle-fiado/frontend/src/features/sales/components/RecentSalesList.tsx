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
    <section className="dashboard-stream-list dashboard-stream-list-compact">
      {sales.slice(0, 3).map((sale) => {
        const paidAmount = Math.max(sale.finalAmount - sale.remainingAmount, 0);
        const progress = sale.finalAmount > 0 ? Math.min((paidAmount / sale.finalAmount) * 100, 100) : 0;

        return (
          <article key={sale.id} className="compact-stream-card sale-stream-card">
            <div className="compact-stream-head">
              <div className="compact-stream-copy">
                <div className="compact-stream-title-row">
                  <strong className="compact-stream-title">{sale.description}</strong>
                  <div className={sale.status === "OVERDUE" ? "badge warning" : "badge success"}>{getSaleStatusLabel(sale.status)}</div>
                </div>
                <div className="customer-meta">
                  {formatDate(sale.saleDate)} | vence em {formatDate(sale.dueDate)}
                </div>
                {sale.saleItems.length ? <div className="customer-meta">{`${sale.saleItems.length} item(ns) registrados`}</div> : null}
              </div>
              <strong className="compact-stream-amount">{formatMoney(sale.finalAmount)}</strong>
            </div>

            <div className="compact-stream-progress">
              <div className="stream-progress-bar compact-progress-bar">
                <span className="stream-progress-fill sales" style={{ width: `${Math.max(progress, 6)}%` }} />
              </div>
              <div className="compact-stream-meta">
                <span>{formatMoney(paidAmount)} pago</span>
                <span>{formatMoney(sale.remainingAmount)} aberto</span>
                <span>{sale.id.slice(0, 8)}</span>
              </div>
            </div>
          </article>
        );
      })}
    </section>
  );
}
