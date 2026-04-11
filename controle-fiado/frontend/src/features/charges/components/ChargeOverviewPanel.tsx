import type { ChargeOverview } from "../types/charge-overview";

function formatMoney(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  }).format(value);
}

type ChargeOverviewPanelProps = {
  overview: ChargeOverview;
};

function renderGroup(title: string, items: ChargeOverview["dueSoon"]) {
  return (
    <div className="detail-column">
      <div className="eyebrow">{title}</div>
      {items.length ? (
        items.map((item) => (
          <article key={item.saleId} className="statement-item">
            <div className="statement-main">
              <strong>{item.customerName}</strong>
              <span>{formatMoney(item.remainingAmount)}</span>
            </div>
            <div className="customer-meta">{item.phone} · {item.status}</div>
          </article>
        ))
      ) : (
        <article className="statement-item">
          <div className="customer-meta">Nenhuma cobranca nesta faixa.</div>
        </article>
      )}
    </div>
  );
}

export function ChargeOverviewPanel({ overview }: ChargeOverviewPanelProps) {
  return (
    <section className="section-block">
      <div className="customer-card">
        <div className="page-header page-header-section">
          <div>
            <div className="eyebrow">Cobrancas</div>
            <h2>Fila operacional</h2>
          </div>
        </div>

        <div className="detail-columns">
          {renderGroup("Vencendo em 3 dias", overview.dueSoon)}
          {renderGroup("Vence hoje", overview.dueToday)}
          {renderGroup("Em atraso", overview.overdue)}
        </div>
      </div>
    </section>
  );
}
