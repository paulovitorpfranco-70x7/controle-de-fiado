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
      <div className="dashboard-panel">
        <div className="dashboard-chart-card">
          <div className="dashboard-card-head">
            <div>
              <div className="eyebrow">Cobrancas</div>
              <h3>Fila de acompanhamento</h3>
              <p className="page-description">Priorize o que vence hoje, o que ja atrasou e o que precisa entrar na proxima rodada.</p>
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
                <span className="label">Em atraso</span>
                <strong>{overview.overdue.length}</strong>
              </div>
            </div>
          </div>

          {urgentCount > 0 ? <div className="queue-alert">{urgentCount} cobranca{urgentCount > 1 ? "s" : ""} exigem atencao imediata hoje.</div> : null}
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
      <article className="dashboard-chart-card charges-lane">
        <div className="dashboard-card-head">
          <div>
            <div className="eyebrow">{title}</div>
            <h3>{items.length} item{items.length === 1 ? "" : "s"}</h3>
          </div>
        </div>

        <div className="customer-stream-list">
          {items.length ? (
            items.map((item) => (
              <article key={item.saleId} className={`stream-card queue-item ${tone}`}>
                <div className="stream-card-head">
                  <div className="stream-card-copy">
                    <div className="stream-kicker">Cliente</div>
                    <div className="stream-title">{item.customerName}</div>
                    <div className="customer-meta">
                      {item.phone} | vence {formatDate(item.dueDate)}
                    </div>
                  </div>
                  <div className={currentSelectedCustomerId === item.customerId ? "badge success" : "badge warning"}>
                    {currentSelectedCustomerId === item.customerId ? "Selecionado" : "Na fila"}
                  </div>
                </div>

                <div className="stream-metrics-grid">
                  <div>
                    <span className="label">Saldo</span>
                    <strong>{formatMoney(item.remainingAmount)}</strong>
                  </div>
                  <div>
                    <span className="label">Status</span>
                    <strong>{item.status}</strong>
                  </div>
                  <div>
                    <span className="label">Venda</span>
                    <strong>{item.saleId.slice(0, 8)}</strong>
                  </div>
                </div>

                {handleSelect ? (
                  <div className="queue-actions">
                    <button className="ghost-button" type="button" onClick={() => handleSelect(item.customerId)}>
                      Abrir cliente
                    </button>
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
