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

function getGroupAmount(items: ChargeOverview["dueSoon"]) {
  return items.reduce((total, item) => total + item.remainingAmount, 0);
}

type ChargeOverviewPanelProps = {
  overview: ChargeOverview;
  selectedCustomerId?: string;
  onSelectCustomer?: (customerId: string) => void;
};

export function ChargeOverviewPanel({ overview, selectedCustomerId, onSelectCustomer }: ChargeOverviewPanelProps) {
  const urgentCount = overview.dueToday.length + overview.overdue.length;
  const summaryCards = [
    { label: "Em 3 dias", count: overview.dueSoon.length, amount: getGroupAmount(overview.dueSoon), tone: "neutral" },
    { label: "Hoje", count: overview.dueToday.length, amount: getGroupAmount(overview.dueToday), tone: "warning" },
    { label: "Em atraso", count: overview.overdue.length, amount: getGroupAmount(overview.overdue), tone: "danger" }
  ] as const;

  return (
    <section className="section-block">
      <div className="dashboard-panel">
        <div className="dashboard-chart-card">
          <div className="dashboard-card-head">
            <div>
              <div className="eyebrow">Cobrancas</div>
              <h3>Fila de acompanhamento</h3>
              <p className="page-description">Priorize o que vence hoje, o que ja atrasou e o que precisa entrar na proxima rodada.</p>
            </div>
          </div>

          {urgentCount > 0 ? (
            <div className="queue-alert">
              {urgentCount} cobranca{urgentCount > 1 ? "s" : ""} exig{urgentCount > 1 ? "em" : "e"} atencao imediata hoje.
            </div>
          ) : null}

          <div className="queue-summary-grid queue-summary-grid-expanded">
            {summaryCards.map((card) => (
              <div key={card.label} className={`queue-summary-card ${card.tone}`}>
                <span className="label">{card.label}</span>
                <strong>{card.count}</strong>
                <span className="customer-meta">{formatMoney(card.amount)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="dashboard-stream-grid charges-column-grid">
          {renderGroup("Vencendo em 3 dias", overview.dueSoon, "neutral", selectedCustomerId, onSelectCustomer)}
          {renderGroup("Vencem hoje", overview.dueToday, "warning", selectedCustomerId, onSelectCustomer)}
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
      <article className={`dashboard-chart-card charges-lane ${tone}`}>
        <div className="dashboard-card-head">
          <div>
            <div className="eyebrow">{title}</div>
            <h3>{items.length} item{items.length === 1 ? "" : "s"}</h3>
          </div>
          <div className="queue-lane-total">
            <span className="label">Valor</span>
            <strong>{formatMoney(getGroupAmount(items))}</strong>
          </div>
        </div>

        <div className="customer-stream-list">
          {items.length ? (
            items.map((item) => (
              <article key={item.saleId} className={`stream-card queue-item selectable-card ${tone}`}>
                <div className="stream-card-head">
                  <div className="stream-card-copy">
                    <div className="stream-title">{item.customerName}</div>
                    <div className="queue-item-meta">
                      <span>{item.phone}</span>
                      <span>Vence {formatDate(item.dueDate)}</span>
                    </div>
                  </div>
                  <div className="queue-balance-block">
                    <span className="label">Saldo</span>
                    <strong>{formatMoney(item.remainingAmount)}</strong>
                  </div>
                </div>

                <div className="customer-card-tags">
                  <span className={`customer-tag ${item.phoneE164 ? "" : "warning"}`}>{item.phoneE164 ? "WhatsApp pronto" : "Sem WhatsApp"}</span>
                  <span className="customer-tag">{item.status}</span>
                </div>

                {handleSelect ? (
                  <div className="queue-actions">
                    <button className="ghost-button" type="button" onClick={() => handleSelect(item.customerId)}>
                      Selecionar
                    </button>
                    <div className={currentSelectedCustomerId === item.customerId ? "badge success" : "badge warning"}>
                      {currentSelectedCustomerId === item.customerId ? "Selecionado" : "Na fila"}
                    </div>
                  </div>
                ) : null}
              </article>
            ))
          ) : (
            <div className="empty-card">Nenhuma cobranca nesta faixa.</div>
          )}
        </div>
      </article>
    );
  }
}
