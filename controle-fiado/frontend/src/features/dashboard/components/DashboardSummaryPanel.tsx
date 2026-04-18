import type { ChargeOverview } from "../../charges/types/charge-overview";
import type { Payment } from "../../payments/types/payment";
import type { Sale } from "../../sales/types/sale";
import type { DashboardSummary } from "../types/dashboard-summary";

function formatMoney(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  }).format(value);
}

function formatShortDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit"
  }).format(new Date(value));
}

function buildTrendData(sales: Sale[], payments: Payment[]) {
  const buckets = new Map<string, { label: string; sales: number; payments: number }>();

  for (const sale of sales) {
    const key = sale.saleDate.slice(0, 10);
    const current = buckets.get(key) ?? { label: formatShortDate(sale.saleDate), sales: 0, payments: 0 };
    current.sales += sale.finalAmount;
    buckets.set(key, current);
  }

  for (const payment of payments) {
    const key = payment.paymentDate.slice(0, 10);
    const current = buckets.get(key) ?? { label: formatShortDate(payment.paymentDate), sales: 0, payments: 0 };
    current.payments += payment.amount;
    buckets.set(key, current);
  }

  return Array.from(buckets.entries())
    .sort((left, right) => left[0].localeCompare(right[0]))
    .slice(-6)
    .map(([, value]) => value);
}

function getChargeSegments(overview: ChargeOverview | null) {
  return [
    { label: "Em atraso", value: overview?.overdue.length ?? 0, color: "#fb7185" },
    { label: "Vence hoje", value: overview?.dueToday.length ?? 0, color: "#f97316" },
    { label: "Proximas", value: overview?.dueSoon.length ?? 0, color: "#60a5fa" }
  ];
}

function getChargeAmount(items: ChargeOverview["dueSoon"] = []) {
  return items.reduce((total, item) => total + item.remainingAmount, 0);
}

function getPrioritySummary(summary: DashboardSummary, overview: ChargeOverview | null) {
  const urgentCount = (overview?.overdue.length ?? 0) + (overview?.dueToday.length ?? 0);

  if (urgentCount > 0) {
    return {
      label: "Prioridade agora",
      title: `${urgentCount} contato${urgentCount > 1 ? "s" : ""} precisa${urgentCount > 1 ? "m" : ""} sair hoje`,
      description: "Comece pelos atrasados e pelos vencimentos do dia antes de abrir a proxima rodada."
    };
  }

  if (summary.dueSoonCount > 0) {
    return {
      label: "Proxima rodada",
      title: `${summary.dueSoonCount} aviso${summary.dueSoonCount > 1 ? "s" : ""} entra${summary.dueSoonCount > 1 ? "m" : ""} nos proximos dias`,
      description: "A carteira esta controlada. Vale preparar a fila antes do vencimento apertar."
    };
  }

  return {
    label: "Carteira sob controle",
    title: "Sem pressao imediata de cobranca",
    description: "Use o painel para acompanhar saldo aberto e ritmo de recebimento, sem urgencias ativas agora."
  };
}

type DashboardSummaryPanelProps = {
  summary: DashboardSummary;
  chargeOverview: ChargeOverview | null;
  sales: Sale[];
  payments: Payment[];
};

export function DashboardSummaryPanel({ summary, chargeOverview, sales, payments }: DashboardSummaryPanelProps) {
  const trendData = buildTrendData(sales, payments);
  const maxTrendValue = Math.max(...trendData.flatMap((item) => [item.sales, item.payments]), 1);
  const chargeSegments = getChargeSegments(chargeOverview);
  const totalChargeItems = chargeSegments.reduce((total, item) => total + item.value, 0);
  const maxDebtorValue = Math.max(...summary.topDebtors.map((item) => item.openBalance), 1);
  const priority = getPrioritySummary(summary, chargeOverview);
  const overdueAmount = getChargeAmount(chargeOverview?.overdue);
  const dueTodayAmount = getChargeAmount(chargeOverview?.dueToday);
  const dueSoonAmount = getChargeAmount(chargeOverview?.dueSoon);
  let accumulatedOffset = 0;

  return (
    <section className="section-block">
      <div className="dashboard-panel">
        <div className="dashboard-hero">
          <div className="dashboard-priority-card">
            <div className="eyebrow">{priority.label}</div>
            <h2>{priority.title}</h2>
            <p className="page-description">{priority.description}</p>

            <div className="dashboard-priority-strip">
              <div className="priority-pill">
                <span className="label">Saldo em aberto</span>
                <strong>{formatMoney(summary.totalOpenBalance)}</strong>
              </div>
              <div className="priority-pill">
                <span className="label">Recebido no periodo</span>
                <strong>{formatMoney(summary.recentPaymentsTotal)}</strong>
              </div>
              <div className="priority-pill">
                <span className="label">Clientes em atraso</span>
                <strong>{summary.overdueCustomers}</strong>
              </div>
            </div>
          </div>

          <div className="dashboard-kpi-grid">
            <article className="dashboard-kpi-card emphasis">
              <span className="label">Em aberto</span>
              <strong>{formatMoney(summary.totalOpenBalance)}</strong>
            </article>
            <article className="dashboard-kpi-card">
              <span className="label">Vence hoje</span>
              <strong>{summary.dueTodayCount}</strong>
            </article>
            <article className="dashboard-kpi-card">
              <span className="label">Vence em 3 dias</span>
              <strong>{summary.dueSoonCount}</strong>
            </article>
            <article className="dashboard-kpi-card">
              <span className="label">Clientes em atraso</span>
              <strong>{summary.overdueCustomers}</strong>
            </article>
          </div>
        </div>

        <div className="dashboard-chart-grid">
          <article className="dashboard-chart-card">
            <div className="dashboard-card-head">
              <div>
                <div className="eyebrow">Movimento</div>
                <h3>Fluxo recente</h3>
              </div>
              <div className="dashboard-legend">
                <span><i className="sales" />Vendas</span>
                <span><i className="payments" />Pagamentos</span>
              </div>
            </div>

            <div className="trend-chart">
              {trendData.length ? (
                trendData.map((point) => (
                  <div key={point.label} className="trend-column">
                    <div className="trend-bars">
                      <span className="trend-bar sales" style={{ height: `${Math.max((point.sales / maxTrendValue) * 100, 6)}%` }} />
                      <span className="trend-bar payments" style={{ height: `${Math.max((point.payments / maxTrendValue) * 100, 6)}%` }} />
                    </div>
                    <span className="trend-label">{point.label}</span>
                  </div>
                ))
              ) : (
                <div className="empty-chart-copy">Sem movimentacao suficiente para montar o grafico.</div>
              )}
            </div>

            <div className="dashboard-metric-row">
              <div>
                <span className="label">Vendido no mes</span>
                <strong>{formatMoney(summary.recentSalesTotal)}</strong>
              </div>
              <div>
                <span className="label">Recebido no mes</span>
                <strong>{formatMoney(summary.recentPaymentsTotal)}</strong>
              </div>
            </div>
          </article>

          <article className="dashboard-chart-card">
            <div className="dashboard-card-head">
              <div>
                <div className="eyebrow">Cobranca</div>
                <h3>Mapa de vencimentos</h3>
              </div>
              <strong>{totalChargeItems}</strong>
            </div>

            <div className="charge-donut-wrap">
              <svg viewBox="0 0 120 120" className="charge-donut" aria-hidden="true">
                <circle cx="60" cy="60" r="42" className="charge-donut-track" />
                {chargeSegments.map((segment) => {
                  const ratio = totalChargeItems > 0 ? segment.value / totalChargeItems : 0;
                  const dashLength = ratio * 263.89;
                  const circle = (
                    <circle
                      key={segment.label}
                      cx="60"
                      cy="60"
                      r="42"
                      className="charge-donut-segment"
                      style={{
                        stroke: segment.color,
                        strokeDasharray: `${dashLength} 263.89`,
                        strokeDashoffset: -accumulatedOffset
                      }}
                    />
                  );
                  accumulatedOffset += dashLength;
                  return circle;
                })}
              </svg>

              <div className="charge-donut-center">
                <strong>{totalChargeItems}</strong>
                <span className="customer-meta">titulos</span>
              </div>
            </div>

            <div className="charge-segment-list">
              {chargeSegments.map((segment) => (
                <div key={segment.label} className="charge-segment-item">
                  <span className="charge-segment-label">
                    <i style={{ backgroundColor: segment.color }} />
                    {segment.label}
                  </span>
                  <strong>{segment.value}</strong>
                </div>
              ))}
            </div>

            <div className="dashboard-metric-row">
              <div>
                <span className="label">Valor em atraso</span>
                <strong>{formatMoney(overdueAmount)}</strong>
              </div>
              <div>
                <span className="label">Vence hoje</span>
                <strong>{formatMoney(dueTodayAmount)}</strong>
              </div>
              <div>
                <span className="label">Proximas</span>
                <strong>{formatMoney(dueSoonAmount)}</strong>
              </div>
            </div>
          </article>
        </div>

        <article className="dashboard-chart-card">
          <div className="dashboard-card-head">
            <div>
              <div className="eyebrow">Clientes</div>
              <h3>Maiores saldos</h3>
            </div>
          </div>

          <div className="debtor-chart">
            {summary.topDebtors.length ? (
              summary.topDebtors.map((debtor) => (
                <div key={debtor.customerId} className="debtor-row">
                  <div className="debtor-copy">
                    <strong>{debtor.customerName}</strong>
                    <span className="customer-meta">{debtor.phone}</span>
                  </div>
                  <div className="debtor-bar-track">
                    <span className="debtor-bar-fill" style={{ width: `${(debtor.openBalance / maxDebtorValue) * 100}%` }} />
                  </div>
                  <div className="debtor-value-block">
                    <strong className="debtor-value">{formatMoney(debtor.openBalance)}</strong>
                    {debtor === summary.topDebtors[0] ? <span className="selection-chip">Maior saldo</span> : null}
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-chart-copy">Nenhum saldo relevante no momento.</div>
            )}
          </div>
        </article>
      </div>
    </section>
  );
}
