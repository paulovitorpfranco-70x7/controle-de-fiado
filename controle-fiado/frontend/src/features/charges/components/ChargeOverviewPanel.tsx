import type { ChargeOverview } from "../types/charge-overview";

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

type ChargeOverviewPanelProps = {
  overview: ChargeOverview;
  selectedCustomerId?: string;
  onSelectCustomer?: (customerId: string) => void;
};

export function ChargeOverviewPanel({ overview, selectedCustomerId, onSelectCustomer }: ChargeOverviewPanelProps) {
  const urgentCount = overview.dueToday.length + overview.overdue.length;

  return (
    <section className="section-block">
      <div className="customer-card">
        <div className="page-header page-header-section">
          <div>
            <div className="eyebrow">Cobrancas</div>
            <h2>Fila operacional</h2>
          </div>
          <div className="queue-summary-grid">
            <div>
              <span className="label">Em 3 dias</span>
              <strong>{overview.dueSoon.length}</strong>
            </div>
            <div>
              <span className="label">Hoje</span>
              <strong>{overview.dueToday.length}</strong>
            </div>
            <div>
              <span className="label">Atrasadas</span>
              <strong>{overview.overdue.length}</strong>
            </div>
          </div>
        </div>

        {urgentCount > 0 ? (
          <div className="queue-alert">
            {urgentCount} cobranca{urgentCount > 1 ? "s" : ""} exigem atencao imediata hoje.
          </div>
        ) : null}

        <div className="detail-columns">
          {renderGroup("Vencendo em 3 dias", overview.dueSoon, "neutral", selectedCustomerId, onSelectCustomer)}
          {renderGroup("Vence hoje", overview.dueToday, "warning", selectedCustomerId, onSelectCustomer)}
          {renderGroup("Em atraso", overview.overdue, "danger", selectedCustomerId, onSelectCustomer)}
        </div>
      </div>
    </section>
  );

  function renderGroup(
    title: string,
    items: ChargeOverview["dueSoon"],
    tone: "neutral" | "warning" | "danger",
    currentSelectedCustomerId?: string,
    handleSelect?: (customerId: string) => void
  ) {
    return (
      <div className="detail-column">
        <div className="eyebrow">{title}</div>
        {items.length ? (
          items.map((item) => (
            <article key={item.saleId} className={`statement-item queue-item ${tone}`}>
              <div className="statement-main">
                <strong>{item.customerName}</strong>
                <span>{formatMoney(item.remainingAmount)}</span>
              </div>
              <div className="customer-meta">
                {item.phone} | vence {formatDate(item.dueDate)} | {item.status}
              </div>
              <div className="queue-actions">
                <span className={`badge ${currentSelectedCustomerId === item.customerId ? "success" : "warning"}`}>
                  {currentSelectedCustomerId === item.customerId ? "Selecionado" : "Na fila"}
                </span>
                {handleSelect ? (
                  <button className="ghost-button" type="button" onClick={() => handleSelect(item.customerId)}>
                    Abrir cliente
                  </button>
                ) : null}
              </div>
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
}
