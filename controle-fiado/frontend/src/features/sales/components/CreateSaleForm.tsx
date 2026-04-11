import { useState } from "react";
import { createSale } from "../api/create-sale";

type CreateSaleFormProps = {
  customerId: string;
  createdById: string;
  onCreated: () => Promise<void> | void;
};

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

function plusDaysIsoDate(days: number) {
  const value = new Date();
  value.setDate(value.getDate() + days);
  return value.toISOString().slice(0, 10);
}

export function CreateSaleForm({ customerId, createdById, onCreated }: CreateSaleFormProps) {
  const [description, setDescription] = useState("Compra de balcão");
  const [originalAmount, setOriginalAmount] = useState("0");
  const [feePercent, setFeePercent] = useState("0");
  const [saleDate, setSaleDate] = useState(todayIsoDate());
  const [dueDate, setDueDate] = useState(plusDaysIsoDate(15));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

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
      <input className="customer-selector" value={description} onChange={(event) => setDescription(event.target.value)} />
      <div className="form-grid">
        <input
          className="customer-selector"
          type="number"
          min="0.01"
          step="0.01"
          value={originalAmount}
          onChange={(event) => setOriginalAmount(event.target.value)}
          placeholder="Valor"
        />
        <input
          className="customer-selector"
          type="number"
          min="0"
          max="100"
          step="0.01"
          value={feePercent}
          onChange={(event) => setFeePercent(event.target.value)}
          placeholder="% acrescimo"
        />
      </div>
      <div className="form-grid">
        <input className="customer-selector" type="date" value={saleDate} onChange={(event) => setSaleDate(event.target.value)} />
        <input className="customer-selector" type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} />
      </div>
      <button className="auth-button" type="submit" disabled={loading}>
        {loading ? "Salvando..." : "Registrar venda"}
      </button>
      {error ? <div className="error-copy">{error}</div> : null}
    </form>
  );
}
