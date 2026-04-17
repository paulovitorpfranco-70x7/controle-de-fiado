import type { SystemStatus } from "../types/system-status";

type SystemStatusPanelProps = {
  status: SystemStatus;
};

export function SystemStatusPanel({ status }: SystemStatusPanelProps) {
  return (
    <section className="section-block">
      <div className="dashboard-panel">
        <div className="dashboard-hero status-hero">
          <article className="dashboard-chart-card">
            <div className="dashboard-card-head">
              <div>
                <div className="eyebrow">Ambiente</div>
                <h3>Status do ambiente</h3>
                <p className="page-description">Leitura consolidada de servico, banco, autenticacao, scheduler e integracoes.</p>
              </div>
            </div>

            <div className="dashboard-kpi-grid">
              <article className="dashboard-kpi-card emphasis">
                <span className="label">Servico</span>
                <strong>{status.service}</strong>
              </article>
              <article className="dashboard-kpi-card">
                <span className="label">Uptime</span>
                <strong>{formatUptime(status.uptimeSeconds)}</strong>
              </article>
              <article className="dashboard-kpi-card">
                <span className="label">Banco</span>
                <strong>{status.database.provider}</strong>
              </article>
              <article className="dashboard-kpi-card">
                <span className="label">Log level</span>
                <strong>{status.logging.level}</strong>
              </article>
            </div>
          </article>

          <article className="dashboard-chart-card">
            <div className="dashboard-card-head">
              <div>
                <div className="eyebrow">Scheduler</div>
                <h3>Agenda operacional</h3>
              </div>
            </div>

            <div className="dashboard-kpi-grid">
              <article className="dashboard-kpi-card">
                <span className="label">Scheduler</span>
                <strong>{status.scheduler.enabled ? "Ativo" : "Desligado"}</strong>
              </article>
              <article className="dashboard-kpi-card">
                <span className="label">Horario</span>
                <strong>{status.scheduler.scheduleTime}</strong>
              </article>
              <article className="dashboard-kpi-card">
                <span className="label">Proxima execucao</span>
                <strong>{status.scheduler.nextRunAt ? new Date(status.scheduler.nextRunAt).toLocaleString("pt-BR") : "Nao agendado"}</strong>
              </article>
              <article className="dashboard-kpi-card">
                <span className="label">Token TTL</span>
                <strong>{status.auth.ttlSeconds > 0 ? formatTtl(status.auth.ttlSeconds) : "Gerenciado"}</strong>
              </article>
            </div>
          </article>
        </div>

        <div className="dashboard-stream-grid status-grid">
          <article className="dashboard-chart-card">
            <div className="dashboard-card-head">
              <div>
                <div className="eyebrow">Integracoes</div>
                <h3>WhatsApp e envio</h3>
              </div>
            </div>

            <div className="stream-metrics-grid">
              <div>
                <span className="label">Provider</span>
                <strong>{status.integrations.whatsappProvider}</strong>
              </div>
              <div>
                <span className="label">Retries</span>
                <strong>{status.integrations.whatsappMaxRetries}</strong>
              </div>
              <div>
                <span className="label">Delay</span>
                <strong>{status.integrations.whatsappRetryDelayMs} ms</strong>
              </div>
            </div>

            <div className="support-card status-support-card">
              <span className="label">Numero Meta</span>
              <strong>{status.integrations.metaPhoneNumberConfigured ? "Configurado" : "Nao configurado"}</strong>
            </div>
          </article>

          <article className="dashboard-chart-card">
            <div className="dashboard-card-head">
              <div>
                <div className="eyebrow">Sinal de vida</div>
                <h3>Leitura rapida</h3>
              </div>
            </div>

            <div className="system-health-list">
              <div className="support-card status-support-card">
                <span className="label">Status</span>
                <strong>{status.status.toUpperCase()}</strong>
              </div>
              <div className="support-card status-support-card">
                <span className="label">Timestamp</span>
                <strong>{new Date(status.timestamp).toLocaleString("pt-BR")}</strong>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}

function formatUptime(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  return `${hours}h ${minutes}min`;
}

function formatTtl(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600);
  return `${hours}h`;
}
