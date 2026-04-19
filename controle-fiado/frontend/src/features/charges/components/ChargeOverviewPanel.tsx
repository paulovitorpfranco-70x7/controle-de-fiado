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
  onSelectCustomer?: (customerId: string) => void;
};

export function ChargeOverviewPanel({ overview, onSelectCustomer }: ChargeOverviewPanelProps) {
  return (
    <section className="section-block">
      <div className="dashboard-panel">
        <div className="dashboard-chart-card">
          <div className="dashboard-card-head">
            <div>
              <div className="eyebrow">Fila</div>
              <h3>Vencimento e atraso</h3>
              <p className="page-description">Selecione um cliente para abrir a mensagem e concluir a cobranca.</p>
            </div>
          </div>
        </div>

        <div className="dashboard-stream-grid charges-column-grid">
          {renderGroup("Vencem hoje", overview.dueToday, "warning", onSelectCustomer)}
          {renderGroup("Em atraso", overview.overdue, "danger", onSelectCustomer)}
        </div>
      </div>
    </section>
  );

  function renderGroup(title: string, items: ChargeOverview["dueSoon"], tone: "neutral" | "warning" | "danger", handleSelect?: (customerId: string) => void) {
    return (
      <article className={`dashboard-chart-card charges-lane ${tone}`}>
        <div className="dashboard-card-head">
          <div>
            <div className="eyebrow">{title}</div>
            <h3>{items.length} item{items.length === 1 ? "" : "s"}</h3>
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

                {!item.phoneE164 ? (
                  <div className="customer-card-tags">
                    <span className="customer-tag warning">Sem WhatsApp</span>
                  </div>
                ) : null}

                {handleSelect ? (
                  <div className="queue-actions">
                    <button className="ghost-button" type="button" onClick={() => handleSelect(item.customerId)}>
                      Enviar mensagem
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
