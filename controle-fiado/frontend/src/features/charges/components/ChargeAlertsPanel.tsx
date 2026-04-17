import type { DailyChargeJobMonitor } from "../types/daily-charge-job-monitor";
import type { ChargeOverview } from "../types/charge-overview";

type ChargeAlertsPanelProps = {
  overview: ChargeOverview;
  monitor: DailyChargeJobMonitor | null;
};

export function ChargeAlertsPanel({ overview, monitor }: ChargeAlertsPanelProps) {
  const alerts = [
    overview.overdue.length > 0
      ? `${overview.overdue.length} cobranca${overview.overdue.length > 1 ? "s" : ""} em atraso exigem contato hoje.`
      : null,
    overview.dueToday.length > 0 ? `${overview.dueToday.length} cobranca${overview.dueToday.length > 1 ? "s" : ""} vencem hoje.` : null,
    monitor && monitor.failedMessagesLast7Days > 0
      ? `${monitor.failedMessagesLast7Days} tentativa${monitor.failedMessagesLast7Days > 1 ? "s" : ""} falharam nos ultimos 7 dias.`
      : null,
    monitor?.lastRunStatus === "failed" ? "A rotina diaria falhou na ultima execucao e precisa de revisao." : null
  ].filter(Boolean) as string[];

  if (!alerts.length) {
    return null;
  }

  return (
    <section className="section-block">
      <div className="customer-card charge-alerts-card">
        <div className="eyebrow">Alertas</div>
        <div className="detail-column">
          {alerts.map((alert) => (
            <div key={alert} className="queue-alert">
              {alert}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
