import { useState } from "react";
import { createSale } from "../api/create-sale";
import { addDaysInputDateValue, todayInputDateValue } from "../../../shared/utils/date-input";

type CreateSaleFormProps = {
  customerId: string;
  createdById: string;
  onCreated: () => Promise<void> | void;
  onSuccess?: (message: string) => void;
};

export function CreateSaleForm({ customerId, createdById, onCreated, onSuccess }: CreateSaleFormProps) {
  const [description, setDescription] = useState("Compra de balcão");
  const [originalAmount, setOriginalAmount] = useState("0");
  const [feePercent, setFeePercent] = useState("0");
  const [saleDate, setSaleDate] = useState(todayInputDateValue());
  const [dueDate, setDueDate] = useState(addDaysInputDateValue(15));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await createSale({
        customerId,
        description,
        originalAmount: Number(originalAmount),
        feePercent: Number(feePercent),
        saleDate,
        dueDate,
        createdById
      });
      setOriginalAmount("0");
      setFeePercent("0");
      setSuccess("Venda registrada com sucesso.");
      onSuccess?.("Venda registrada com sucesso.");
      await onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao criar venda.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="operation-form" onSubmit={handleSubmit}>
      <div className="eyebrow">Nova venda</div>
      <label className="field-block">
        <span className="label">Descricao</span>
        <input
          className="customer-selector"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Descricao da venda"
        />
      </label>
      <div className="form-grid">
        <label className="field-block">
          <span className="label">Valor da venda</span>
          <input
            className="customer-selector"
            type="number"
            min="0.01"
            step="0.01"
            value={originalAmount}
            onChange={(event) => setOriginalAmount(event.target.value)}
            placeholder="Ex: 50,00"
          />
        </label>
        <label className="field-block">
          <span className="label">% de acrescimo</span>
          <input
            className="customer-selector"
            type="number"
            min="0"
            max="100"
            step="0.01"
            value={feePercent}
            onChange={(event) => setFeePercent(event.target.value)}
            placeholder="Ex: 10"
          />
        </label>
      </div>
      <div className="form-grid">
        <label className="field-block">
          <span className="label">Data da venda</span>
          <input className="customer-selector" type="date" value={saleDate} onChange={(event) => setSaleDate(event.target.value)} />
        </label>
        <label className="field-block">
          <span className="label">Data de vencimento</span>
          <input className="customer-selector" type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} />
        </label>
      </div>
      <button className="auth-button" type="submit" disabled={loading}>
        {loading ? "Salvando..." : "Registrar venda"}
      </button>
      {success ? <div className="success-copy">{success}</div> : null}
      {error ? <div className="error-copy">{error}</div> : null}
    </form>
  );
}
