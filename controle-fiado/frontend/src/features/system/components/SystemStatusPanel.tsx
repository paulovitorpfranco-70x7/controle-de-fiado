import type { SystemStatus } from "../types/system-status";

type SystemStatusPanelProps = {
  status: SystemStatus;
};

export function SystemStatusPanel({ status }: SystemStatusPanelProps) {
  return (
    <section className="section-block">
      <div className="customer-card">
        <div className="page-header page-header-section">
          <div>
            <div className="eyebrow">Operacao</div>
            <h2>Status do backend</h2>
          </div>
        </div>

        <div className="customer-grid">
          <div>
            <span className="label">Servico</span>
            <strong>{status.service}</strong>
          </div>
          <div>
            <span className="label">Uptime</span>
            <strong>{formatUptime(status.uptimeSeconds)}</strong>
          </div>
          <div>
            <span className="label">Banco</span>
            <strong>{status.database.provider}</strong>
          </div>
          <div>
            <span className="label">WhatsApp</span>
            <strong>{status.integrations.whatsappProvider}</strong>
          </div>
          <div>
            <span className="label">Retries WhatsApp</span>
            <strong>{status.integrations.whatsappMaxRetries}</strong>
          </div>
          <div>
            <span className="label">Delay retry</span>
            <strong>{status.integrations.whatsappRetryDelayMs} ms</strong>
          </div>
          <div>
            <span className="label">Meta configurado</span>
            <strong>{status.integrations.metaPhoneNumberConfigured ? "Sim" : "Nao"}</strong>
          </div>
          <div>
            <span className="label">Scheduler</span>
            <strong>{status.scheduler.enabled ? "Ativo" : "Desligado"}</strong>
          </div>
          <div>
            <span className="label">Horario</span>
            <strong>{status.scheduler.scheduleTime}</strong>
          </div>
          <div>
            <span className="label">Proxima execucao</span>
            <strong>{status.scheduler.nextRunAt ? new Date(status.scheduler.nextRunAt).toLocaleString("pt-BR") : "Nao agendado"}</strong>
          </div>
          <div>
            <span className="label">TTL do token</span>
            <strong>{formatTtl(status.auth.ttlSeconds)}</strong>
          </div>
          <div>
            <span className="label">Log level</span>
            <strong>{status.logging.level}</strong>
          </div>
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
