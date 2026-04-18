import type { DailyChargeJobMonitor } from "../types/daily-charge-job-monitor";
import type { ChargeOverview } from "../types/charge-overview";

type ChargeAlertsPanelProps = {
  overview: ChargeOverview;
  monitor: DailyChargeJobMonitor | null;
};

export function ChargeAlertsPanel({ overview, monitor }: ChargeAlertsPanelProps) {
  const alerts = [
    overview.overdue.length > 0
      ? {
          title: "Atrasos ativos",
          body: `${overview.overdue.length} cobranca${overview.overdue.length > 1 ? "s" : ""} em atraso exig${overview.overdue.length > 1 ? "em" : "e"} contato hoje.`,
          tone: "danger"
        }
      : null,
    overview.dueToday.length > 0
      ? {
          title: "Vencimento de hoje",
          body: `${overview.dueToday.length} cobranca${overview.dueToday.length > 1 ? "s" : ""} vencem hoje.`,
          tone: "warning"
        }
      : null,
    monitor && monitor.failedMessagesLast7Days > 0
      ? {
          title: "Falhas recentes",
          body: `${monitor.failedMessagesLast7Days} tentativa${monitor.failedMessagesLast7Days > 1 ? "s" : ""} falharam nos ultimos 7 dias.`,
          tone: "neutral"
        }
      : null,
    monitor?.lastRunStatus === "failed"
      ? {
          title: "Rotina interrompida",
          body: "A rotina diaria falhou na ultima execucao e precisa de revisao.",
          tone: "danger"
        }
      : null
  ].filter(Boolean) as Array<{ title: string; body: string; tone: "danger" | "warning" | "neutral" }>;

  if (!alerts.length) {
    return null;
  }

  return (
    <section className="section-block">
      <div className="customer-card charge-alerts-card">
        <div className="eyebrow">Alertas</div>
        <div className="charge-alert-grid">
          {alerts.map((alert) => (
            <article key={alert.title} className={`queue-alert charge-alert-card ${alert.tone}`}>
              <span className="label">{alert.title}</span>
              <strong>{alert.body}</strong>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
