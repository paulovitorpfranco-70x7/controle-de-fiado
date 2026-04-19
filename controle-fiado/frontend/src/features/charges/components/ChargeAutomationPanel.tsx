import { useState } from "react";
import { runDailyChargeJob, type DailyChargeJobResult } from "../api/run-daily-charge-job";
import type { DailyChargeJobMonitor } from "../types/daily-charge-job-monitor";

type ChargeAutomationPanelProps = {
  onCompleted: () => Promise<void> | void;
  onSuccess?: (message: string) => void;
  monitor: DailyChargeJobMonitor | null;
  canRun: boolean;
};

function getStatusTone(status: DailyChargeJobMonitor["lastRunStatus"]) {
  if (status === "success") return "success";
  if (status === "failed") return "warning";
  return "neutral";
}

export function ChargeAutomationPanel({ onCompleted, onSuccess, monitor, canRun }: ChargeAutomationPanelProps) {
  const [result, setResult] = useState<DailyChargeJobResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRun() {
    setLoading(true);
    setError(null);

    try {
      const data = await runDailyChargeJob();
      setResult(data);
      onSuccess?.("Rotina diaria executada com sucesso.");
      await onCompleted();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao executar a rotina.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="section-block">
      <div className="dashboard-panel charges-panel-stack">
        <div className="dashboard-hero charges-hero">
          <article className="dashboard-chart-card">
            <div className="dashboard-card-head">
              <div>
                <div className="eyebrow">Automacao</div>
                <h3>Rotina diaria de cobranca</h3>
                <p className="page-description">Dispara avisos de vencimento, evita duplicidade e atualiza o monitor operacional.</p>
              </div>
              <button className="auth-button compact-action-button" type="button" onClick={handleRun} disabled={loading || !canRun}>
                {loading ? "Executando..." : "Executar agora"}
              </button>
            </div>

            {!canRun ? <div className="empty-card">Somente o perfil OWNER pode executar a rotina manualmente.</div> : null}

            {result ? (
              <div className="dashboard-kpi-grid">
                <article className="dashboard-kpi-card">
                  <span className="label">3 dias</span>
                  <strong>{result.auto3DaysSent}</strong>
                </article>
                <article className="dashboard-kpi-card">
                  <span className="label">No vencimento</span>
                  <strong>{result.autoDueDateSent}</strong>
                </article>
                <article className="dashboard-kpi-card">
                  <span className="label">Duplicadas</span>
                  <strong>{result.skippedDuplicates}</strong>
                </article>
                <article className="dashboard-kpi-card">
                  <span className="label">Falhas</span>
                  <strong>{result.failedMessages}</strong>
                </article>
              </div>
            ) : null}
          </article>

          <article className="dashboard-chart-card">
            <div className="dashboard-card-head">
              <div>
                <div className="eyebrow">Monitor</div>
                <h3>Saude da automacao</h3>
                <p className="page-description">Leitura rapida da ultima execucao e do nivel de falha recente.</p>
              </div>
            </div>

            {monitor ? (
              <div className="dashboard-kpi-grid">
                <article className="dashboard-kpi-card">
                  <span className="label">Ultima execucao</span>
                  <strong>{monitor.lastRunAt ? new Date(monitor.lastRunAt).toLocaleString("pt-BR") : "Nunca"}</strong>
                </article>
                <article className="dashboard-kpi-card">
                  <span className="label">Status</span>
                  <span className={`customer-tag ${getStatusTone(monitor.lastRunStatus)}`}>{renderStatus(monitor.lastRunStatus)}</span>
                </article>
                <article className="dashboard-kpi-card">
                  <span className="label">Falhas totais</span>
                  <strong>{monitor.failedMessagesTotal}</strong>
                </article>
                <article className="dashboard-kpi-card">
                  <span className="label">Falhas em 7 dias</span>
                  <strong>{monitor.failedMessagesLast7Days}</strong>
                </article>
              </div>
            ) : (
              <div className="empty-card">Monitor ainda sem registros de execucao.</div>
            )}

            {monitor?.lastFailureMessage ? (
              <div className="operation-notice error">
                <span className="operation-notice-label">Ultima falha</span>
                <strong>{monitor.lastFailureMessage}</strong>
              </div>
            ) : null}
          </article>
        </div>

        {result ? (
          <div className="operation-notice success">
            <span className="operation-notice-label">Resumo da execucao</span>
            <strong>{summarizeExecution(result)}</strong>
          </div>
        ) : null}

        {error ? <div className="operation-notice error">{error}</div> : null}
      </div>
    </section>
  );
}

function renderStatus(status: DailyChargeJobMonitor["lastRunStatus"]) {
  if (status === "success") return "Sucesso";
  if (status === "failed") return "Falhou";
  return "Nunca executado";
}

function summarizeExecution(result: DailyChargeJobResult) {
  const preparedMessages = result.auto3DaysSent + result.autoDueDateSent;

  if (preparedMessages === 0 && result.failedMessages === 0 && result.skippedDuplicates === 0) {
    return "Nenhuma nova mensagem foi preparada nesta execucao.";
  }

  if (preparedMessages === 0 && result.failedMessages === 0) {
    return `${result.skippedDuplicates} duplicata(s) foi(ram) ignorada(s). Nenhuma nova mensagem precisou ser preparada.`;
  }

  return `${preparedMessages} mensagem(ns) preparada(s), ${result.failedMessages} falha(s) e ${result.skippedDuplicates} duplicata(s) ignorada(s).`;
}
