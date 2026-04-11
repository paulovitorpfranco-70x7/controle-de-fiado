import { useState } from "react";
import { runDailyChargeJob, type DailyChargeJobResult } from "../api/run-daily-charge-job";

type ChargeAutomationPanelProps = {
  onCompleted: () => Promise<void> | void;
  onSuccess?: (message: string) => void;
};

export function ChargeAutomationPanel({ onCompleted, onSuccess }: ChargeAutomationPanelProps) {
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
          </div>
        ) : null}

        {error ? <div className="error-copy">{error}</div> : null}
      </div>
    </section>
  );
}
