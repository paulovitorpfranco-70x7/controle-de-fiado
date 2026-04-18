import type { ChargeOverview } from "../../charges/types/charge-overview";
import type { DailyChargeJobMonitor } from "../../charges/types/daily-charge-job-monitor";
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
      description: "Separe atrasos e vencimentos do dia primeiro. O resto do painel entra como suporte para decidir a ordem."
    };
  }

  if (summary.dueSoonCount > 0) {
    return {
      label: "Janela seguinte",
      title: `${summary.dueSoonCount} aviso${summary.dueSoonCount > 1 ? "s" : ""} entra${summary.dueSoonCount > 1 ? "m" : ""} na fila curta`,
      description: "A carteira nao esta sob pressao imediata. Vale organizar quem vence em seguida antes de virar atraso."
    };
  }

  return {
    label: "Carteira sob controle",
    title: "Sem urgencia operacional agora",
    description: "Use o dashboard para acompanhar concentracao de fiado e ritmo de recebimento, sem apagar incendio."
  };
}

function buildLateCustomerData(overview: ChargeOverview | null) {
  const buckets = new Map<
    string,
    {
      customerId: string;
      customerName: string;
      phone: string;
      overdueCount: number;
      dueTodayCount: number;
      totalAmount: number;
    }
  >();

  for (const item of overview?.overdue ?? []) {
    const current = buckets.get(item.customerId) ?? {
      customerId: item.customerId,
      customerName: item.customerName,
      phone: item.phone,
      overdueCount: 0,
      dueTodayCount: 0,
      totalAmount: 0
    };
    current.overdueCount += 1;
    current.totalAmount += item.remainingAmount;
    buckets.set(item.customerId, current);
  }

  for (const item of overview?.dueToday ?? []) {
    const current = buckets.get(item.customerId) ?? {
      customerId: item.customerId,
      customerName: item.customerName,
      phone: item.phone,
      overdueCount: 0,
      dueTodayCount: 0,
      totalAmount: 0
    };
    current.dueTodayCount += 1;
    current.totalAmount += item.remainingAmount;
    buckets.set(item.customerId, current);
  }

  return Array.from(buckets.values())
    .sort((left, right) => {
      const scoreDiff = right.overdueCount * 3 + right.dueTodayCount - (left.overdueCount * 3 + left.dueTodayCount);
      if (scoreDiff !== 0) {
        return scoreDiff;
      }

      return right.totalAmount - left.totalAmount;
    })
    .slice(0, 5);
}

function buildOperationalAlerts(overview: ChargeOverview | null, monitor: DailyChargeJobMonitor | null) {
  return [
    overview && overview.overdue.length > 0
      ? {
          title: "Atrasos ativos",
          body: `${overview.overdue.length} cobranca${overview.overdue.length > 1 ? "s" : ""} ja passaram do prazo.`,
          tone: "danger" as const
        }
      : null,
    overview && overview.dueToday.length > 0
      ? {
          title: "Vencimento de hoje",
          body: `${overview.dueToday.length} titulo${overview.dueToday.length > 1 ? "s vencem" : " vence"} hoje.`,
          tone: "warning" as const
        }
      : null,
    monitor?.failedMessagesLast7Days
      ? {
          title: "Falhas recentes",
          body: `${monitor.failedMessagesLast7Days} envio${monitor.failedMessagesLast7Days > 1 ? "s falharam" : " falhou"} nos ultimos 7 dias.`,
          tone: "neutral" as const
        }
      : null
  ].filter(Boolean) as Array<{ title: string; body: string; tone: "danger" | "warning" | "neutral" }>;
}

type DashboardSummaryPanelProps = {
  summary: DashboardSummary;
  chargeOverview: ChargeOverview | null;
  monitor: DailyChargeJobMonitor | null;
  sales: Sale[];
  payments: Payment[];
};

export function DashboardSummaryPanel({ summary, chargeOverview, monitor, sales, payments }: DashboardSummaryPanelProps) {
  const trendData = buildTrendData(sales, payments);
  const maxTrendValue = Math.max(...trendData.flatMap((item) => [item.sales, item.payments]), 1);
  const chargeSegments = getChargeSegments(chargeOverview);
  const totalChargeItems = chargeSegments.reduce((total, item) => total + item.value, 0);
  const maxDebtorValue = Math.max(...summary.topDebtors.map((item) => item.openBalance), 1);
  const priority = getPrioritySummary(summary, chargeOverview);
  const overdueAmount = getChargeAmount(chargeOverview?.overdue);
  const dueTodayAmount = getChargeAmount(chargeOverview?.dueToday);
  const dueSoonAmount = getChargeAmount(chargeOverview?.dueSoon);
  const lateCustomers = buildLateCustomerData(chargeOverview);
  const operationalAlerts = buildOperationalAlerts(chargeOverview, monitor);
  const overdueCustomerCount = chargeOverview
    ? new Set(chargeOverview.overdue.map((item) => item.customerId)).size
    : summary.overdueCustomers;
  const recoveryRate = summary.totalOpenBalance > 0 ? Math.round((summary.recentPaymentsTotal / summary.totalOpenBalance) * 100) : 0;
  const concentrationBase = Math.max(summary.totalOpenBalance, 1);
  const topDebtor = summary.topDebtors[0] ?? null;
  const supportingDebtors = summary.topDebtors.slice(1, 4);
  const topLateCustomer = lateCustomers[0] ?? null;
  const supportingLateCustomers = lateCustomers.slice(1, 4);

  return (
    <section className="section-block">
      <div className="dashboard-panel">
        <div className="dashboard-impact-grid">
          <article className="dashboard-priority-card dashboard-priority-card-clean dashboard-priority-card-hero">
            <div className="dashboard-priority-header">
              <div>
                <div className="eyebrow">{priority.label}</div>
                <h2>{priority.title}</h2>
                <p className="page-description">{priority.description}</p>
              </div>

              <div className="dashboard-priority-badge">
                <span className="label">Pulso da carteira</span>
                <strong>{overdueCustomerCount > 0 || totalChargeItems > 0 ? "Atencao alta" : "Ritmo estavel"}</strong>
              </div>
            </div>

            <div className="dashboard-priority-stat-row">
              <div className="dashboard-priority-stat">
                <span className="label">Saldo em aberto</span>
                <strong>{formatMoney(summary.totalOpenBalance)}</strong>
              </div>
              <div className="dashboard-priority-stat">
                <span className="label">Recebido no periodo</span>
                <strong>{formatMoney(summary.recentPaymentsTotal)}</strong>
              </div>
              <div className="dashboard-priority-stat">
                <span className="label">Clientes em atraso</span>
                <strong>{overdueCustomerCount}</strong>
              </div>
            </div>
          </article>

          <article className="dashboard-chart-card dashboard-focus-card">
            <div className="dashboard-card-head">
              <div>
                <div className="eyebrow">Concentracao</div>
                <h3>Quem mais puxa fiado</h3>
              </div>
            </div>

            {topDebtor ? (
              <>
                <div className="dashboard-focus-lead">
                  <div>
                    <strong>{topDebtor.customerName}</strong>
                    <span className="customer-meta">{topDebtor.phone}</span>
                  </div>
                  <strong className="dashboard-focus-amount">{formatMoney(topDebtor.openBalance)}</strong>
                </div>

                <div className="dashboard-focus-meter">
                  <span style={{ width: `${(topDebtor.openBalance / maxDebtorValue) * 100}%` }} />
                </div>

                <div className="dashboard-focus-note">
                  {Math.round((topDebtor.openBalance / concentrationBase) * 100)}% da carteira aberta esta concentrada aqui.
                </div>

                {supportingDebtors.length ? (
                  <div className="dashboard-mini-stack">
                    {supportingDebtors.map((debtor) => (
                      <div key={debtor.customerId} className="dashboard-mini-row">
                        <span>{debtor.customerName}</span>
                        <strong>{formatMoney(debtor.openBalance)}</strong>
                      </div>
                    ))}
                  </div>
                ) : null}
              </>
            ) : (
              <div className="empty-chart-copy">Nenhum saldo relevante no momento.</div>
            )}
          </article>

          <article className="dashboard-chart-card dashboard-focus-card dashboard-focus-card-danger">
            <div className="dashboard-card-head">
              <div>
                <div className="eyebrow">Urgencia</div>
                <h3>Quem mais atrasa</h3>
              </div>
            </div>

            {topLateCustomer ? (
              <>
                <div className="dashboard-focus-lead">
                  <div>
                    <strong>{topLateCustomer.customerName}</strong>
                    <span className="customer-meta">{topLateCustomer.phone}</span>
                  </div>
                  <strong className="dashboard-focus-amount">{formatMoney(topLateCustomer.totalAmount)}</strong>
                </div>

                <div className="dashboard-focus-meter dashboard-focus-meter-danger">
                  <span
                    style={{
                      width: `${((topLateCustomer.overdueCount * 3 + topLateCustomer.dueTodayCount) / Math.max(...lateCustomers.map((item) => item.overdueCount * 3 + item.dueTodayCount), 1)) * 100}%`
                    }}
                  />
                </div>

                <div className="dashboard-focus-note">
                  {topLateCustomer.overdueCount > 0
                    ? `${topLateCustomer.overdueCount} atraso${topLateCustomer.overdueCount > 1 ? "s" : ""} ativo${topLateCustomer.overdueCount > 1 ? "s" : ""}.`
                    : `${topLateCustomer.dueTodayCount} vencimento${topLateCustomer.dueTodayCount > 1 ? "s" : ""} cai${topLateCustomer.dueTodayCount > 1 ? "em" : ""} hoje.`}
                </div>

                {supportingLateCustomers.length ? (
                  <div className="dashboard-mini-stack">
                    {supportingLateCustomers.map((customer) => (
                      <div key={customer.customerId} className="dashboard-mini-row">
                        <span>{customer.customerName}</span>
                        <strong>{customer.overdueCount > 0 ? `${customer.overdueCount} atraso${customer.overdueCount > 1 ? "s" : ""}` : `${customer.dueTodayCount} hoje`}</strong>
                      </div>
                    ))}
                  </div>
                ) : null}
              </>
            ) : (
              <div className="empty-chart-copy">Nenhum cliente com atraso ou vencimento imediato no momento.</div>
            )}
          </article>
        </div>

        <div className="dashboard-support-grid">
          <article className="dashboard-chart-card dashboard-flow-card">
            <div className="dashboard-card-head">
              <div>
                <div className="eyebrow">Movimento</div>
                <h3>Fluxo recente de vendas e pagamentos</h3>
              </div>
              <div className="dashboard-legend">
                <span><i className="sales" />Vendas</span>
                <span><i className="payments" />Pagamentos</span>
              </div>
            </div>

            <div className="trend-chart" style={{ gridTemplateColumns: `repeat(${Math.max(trendData.length, 1)}, minmax(0, 1fr))` }}>
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

            <div className="dashboard-metric-row dashboard-metric-row-spacious">
              <div>
                <span className="label">Vendido no periodo</span>
                <strong>{formatMoney(summary.recentSalesTotal)}</strong>
              </div>
              <div>
                <span className="label">Recebido no periodo</span>
                <strong>{formatMoney(summary.recentPaymentsTotal)}</strong>
              </div>
              <div>
                <span className="label">Giro de recuperacao</span>
                <strong>{recoveryRate}%</strong>
              </div>
            </div>
          </article>

          <article className="dashboard-chart-card dashboard-support-card">
            <div className="dashboard-card-head">
              <div>
                <div className="eyebrow">Cobranca</div>
                <h3>O que precisa separar agora</h3>
              </div>
              <strong>{totalChargeItems}</strong>
            </div>

            <div className="dashboard-support-list">
              {chargeSegments.map((segment) => (
                <div key={segment.label} className="dashboard-support-row">
                  <span className="charge-segment-label">
                    <i style={{ backgroundColor: segment.color }} />
                    {segment.label}
                  </span>
                  <div className="dashboard-segment-values">
                    <strong>{segment.value}</strong>
                    <span>{segment.label === "Em atraso" ? formatMoney(overdueAmount) : segment.label === "Vence hoje" ? formatMoney(dueTodayAmount) : formatMoney(dueSoonAmount)}</span>
                  </div>
                </div>
              ))}
            </div>

            {operationalAlerts.length ? (
              <div className="dashboard-alert-stack">
                {operationalAlerts.map((alert) => (
                  <article key={alert.title} className={`dashboard-inline-alert ${alert.tone}`}>
                    <span className="label">{alert.title}</span>
                    <strong>{alert.body}</strong>
                  </article>
                ))}
              </div>
            ) : (
              <div className="empty-chart-copy">Sem alertas criticos de cobranca agora.</div>
            )}

            {supportingLateCustomers.length ? (
              <div className="dashboard-mini-stack dashboard-mini-stack-muted">
                {supportingLateCustomers.map((customer) => (
                  <div key={customer.customerId} className="dashboard-mini-row">
                    <span>{customer.customerName}</span>
                    <strong>{formatMoney(customer.totalAmount)}</strong>
                  </div>
                ))}
              </div>
            ) : null}
          </article>
        </div>

        <div className="dashboard-stream-grid">
          <article className="dashboard-chart-card">
            <div className="dashboard-card-head">
              <div>
                <div className="eyebrow">Clientes</div>
                <h3>Maiores saldos em aberto</h3>
              </div>
            </div>

            <div className="dashboard-ranked-list">
              {summary.topDebtors.length ? (
                summary.topDebtors.map((debtor) => (
                  <div key={debtor.customerId} className="dashboard-ranked-row">
                    <div className="dashboard-ranked-copy">
                      <strong>{debtor.customerName}</strong>
                      <span className="customer-meta">{debtor.phone}</span>
                    </div>
                    <div className="dashboard-ranked-bar-track">
                      <span className="dashboard-ranked-bar-fill" style={{ width: `${(debtor.openBalance / maxDebtorValue) * 100}%` }} />
                    </div>
                    <div className="dashboard-ranked-value">
                      <strong>{formatMoney(debtor.openBalance)}</strong>
                      <span>{Math.round((debtor.openBalance / concentrationBase) * 100)}% da carteira</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-chart-copy">Nenhum saldo relevante no momento.</div>
              )}
            </div>
          </article>

          <article className="dashboard-chart-card">
            <div className="dashboard-card-head">
              <div>
                <div className="eyebrow">Clientes</div>
                <h3>Historico de atraso</h3>
              </div>
            </div>

            <div className="dashboard-ranked-list dashboard-ranked-list-compact">
              {lateCustomers.length ? (
                lateCustomers.map((customer) => {
                  const pressureScore = customer.overdueCount * 3 + customer.dueTodayCount;
                  const pressureMax = Math.max(...lateCustomers.map((item) => item.overdueCount * 3 + item.dueTodayCount), 1);

                  return (
                    <div key={customer.customerId} className="dashboard-ranked-row dashboard-ranked-row-compact">
                      <div className="dashboard-ranked-copy">
                        <strong>{customer.customerName}</strong>
                        <span className="customer-meta">{customer.phone}</span>
                      </div>
                      <div className="dashboard-ranked-bar-track dashboard-ranked-bar-track-danger">
                        <span className="dashboard-ranked-bar-fill dashboard-ranked-bar-fill-danger" style={{ width: `${(pressureScore / pressureMax) * 100}%` }} />
                      </div>
                      <div className="dashboard-ranked-value">
                        <strong>{formatMoney(customer.totalAmount)}</strong>
                        <span>
                          {customer.overdueCount > 0
                            ? `${customer.overdueCount} atraso${customer.overdueCount > 1 ? "s" : ""}`
                            : `${customer.dueTodayCount} vencimento${customer.dueTodayCount > 1 ? "s" : ""} hoje`}
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="empty-chart-copy">Nenhum cliente com atraso ou vencimento imediato no momento.</div>
              )}
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
