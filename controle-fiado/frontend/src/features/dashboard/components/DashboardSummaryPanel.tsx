import type { DashboardSummary } from "../types/dashboard-summary";

function formatMoney(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  }).format(value);
}

type DashboardSummaryPanelProps = {
  summary: DashboardSummary;
};

export function DashboardSummaryPanel({ summary }: DashboardSummaryPanelProps) {
  return (
    <section className="section-block">
      <div className="customer-card">
        <div className="page-header page-header-section">
          <div>
            <div className="eyebrow">Dashboard</div>
            <h2>Resumo real da operacao</h2>
          </div>
        </div>

        <div className="customer-grid">
          <div>
            <span className="label">Em aberto</span>
            <strong>{formatMoney(summary.totalOpenBalance)}</strong>
          </div>
          <div>
            <span className="label">Vence hoje</span>
            <strong>{summary.dueTodayCount}</strong>
          </div>
          <div>
            <span className="label">Vencendo em 3 dias</span>
            <strong>{summary.dueSoonCount}</strong>
          </div>
          <div>
            <span className="label">Recebido no mes</span>
            <strong>{formatMoney(summary.recentPaymentsTotal)}</strong>
          </div>
          <div>
            <span className="label">Vendido no mes</span>
            <strong>{formatMoney(summary.recentSalesTotal)}</strong>
          </div>
          <div>
            <span className="label">Clientes com saldo</span>
            <strong>{summary.overdueCustomers}</strong>
          </div>
        </div>

        <div className="detail-column dashboard-debtors">
          <div className="eyebrow">Maiores saldos</div>
          {summary.topDebtors.map((debtor) => (
            <article key={debtor.customerId} className="statement-item">
              <div className="statement-main">
                <strong>{debtor.customerName}</strong>
                <span>{formatMoney(debtor.openBalance)}</span>
              </div>
              <div className="customer-meta">{debtor.phone}</div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
