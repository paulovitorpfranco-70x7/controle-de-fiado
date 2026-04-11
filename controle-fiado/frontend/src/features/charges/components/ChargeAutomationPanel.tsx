import { useState } from "react";
import { runDailyChargeJob, type DailyChargeJobResult } from "../api/run-daily-charge-job";
import type { DailyChargeJobMonitor } from "../types/daily-charge-job-monitor";

type ChargeAutomationPanelProps = {
  onCompleted: () => Promise<void> | void;
  onSuccess?: (message: string) => void;
  monitor: DailyChargeJobMonitor | null;
};

export function ChargeAutomationPanel({ onCompleted, onSuccess, monitor }: ChargeAutomationPanelProps) {
  const [result, setResult] = useState<DailyChargeJobResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRun() {
    setLoading(true);
    setError(null);

    try {
      const data = await runDailyChargeJob();
      setResult(data);
      onSuccess?.("Job diario executado com sucesso.");
      await onCompleted();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao rodar job.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="section-block">
      <div className="customer-card">
        <div className="page-header page-header-section">
          <div>
            <div className="eyebrow">Automacao</div>
            <h2>Job diario de cobranca</h2>
          </div>
          <button className="auth-button" type="button" onClick={handleRun} disabled={loading}>
            {loading ? "Rodando..." : "Executar agora"}
          </button>
        </div>

        {result ? (
          <div className="customer-grid">
            <div>
              <span className="label">3 dias</span>
              <strong>{result.auto3DaysSent}</strong>
            </div>
            <div>
              <span className="label">No vencimento</span>
              <strong>{result.autoDueDateSent}</strong>
            </div>
            <div>
              <span className="label">Duplicadas</span>
              <strong>{result.skippedDuplicates}</strong>
            </div>
            <div>
              <span className="label">Falhas</span>
              <strong>{result.failedMessages}</strong>
            </div>
          </div>
        ) : null}

        {monitor ? (
          <div className="customer-grid">
            <div>
              <span className="label">Ultima execucao</span>
              <strong>{monitor.lastRunAt ? new Date(monitor.lastRunAt).toLocaleString("pt-BR") : "Nunca"}</strong>
            </div>
            <div>
              <span className="label">Status</span>
              <strong>{renderStatus(monitor.lastRunStatus)}</strong>
            </div>
            <div>
              <span className="label">Falhas total</span>
              <strong>{monitor.failedMessagesTotal}</strong>
            </div>
            <div>
              <span className="label">Falhas 7 dias</span>
              <strong>{monitor.failedMessagesLast7Days}</strong>
            </div>
          </div>
        ) : null}

        {monitor?.lastFailureMessage ? (
          <p className="muted-copy">
            Ultima falha: {monitor.lastFailureMessage}
          </p>
        ) : null}

        {error ? <div className="error-copy">{error}</div> : null}
      </div>
    </section>
  );
}

function renderStatus(status: DailyChargeJobMonitor["lastRunStatus"]) {
  if (status === "success") return "Sucesso";
  if (status === "failed") return "Falhou";
  return "Nunca executado";
}
