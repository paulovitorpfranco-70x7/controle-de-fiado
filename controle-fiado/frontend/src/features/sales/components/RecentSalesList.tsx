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

type RecentSalesListProps = {
  sales: Sale[];
};

export function RecentSalesList({ sales }: RecentSalesListProps) {
  return (
    <section className="card-list">
      {sales.map((sale) => (
        <article key={sale.id} className="customer-card">
          <div className="customer-main">
            <div>
              <div className="customer-name">{sale.description}</div>
              <div className="customer-meta">
                Venda em {formatDate(sale.saleDate)} · Vence em {formatDate(sale.dueDate)}
              </div>
            </div>
            <div className={sale.status === "OVERDUE" ? "badge warning" : "badge success"}>{sale.status}</div>
          </div>
          <div className="customer-grid">
            <div>
              <span className="label">Valor final</span>
              <strong>{formatMoney(sale.finalAmount)}</strong>
            </div>
            <div>
              <span className="label">Em aberto</span>
              <strong>{formatMoney(sale.remainingAmount)}</strong>
            </div>
            <div>
              <span className="label">Acrescimo</span>
              <strong>{formatMoney(sale.feeAmount)}</strong>
            </div>
          </div>
        </article>
      ))}
    </section>
  );
}
