import { useState } from "react";
import { createPayment } from "../api/create-payment";

type CreatePaymentFormProps = {
  customerId: string;
  createdById: string;
  onCreated: () => Promise<void> | void;
};

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

export function CreatePaymentForm({ customerId, createdById, onCreated }: CreatePaymentFormProps) {
  const [amount, setAmount] = useState("0");
  const [paymentDate, setPaymentDate] = useState(todayIsoDate());
  const [method, setMethod] = useState<"CASH" | "PIX" | "CARD">("PIX");
  const [notes, setNotes] = useState("Pagamento registrado no caixa.");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await createPayment({
        customerId,
        amount: Number(amount),
        paymentDate,
        method,
        notes,
        createdById
      });
      setAmount("0");
      await onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao registrar pagamento.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="operation-form" onSubmit={handleSubmit}>
      <div className="eyebrow">Novo pagamento</div>
      <div className="form-grid">
        <input
          className="customer-selector"
          type="number"
          min="0.01"
          step="0.01"
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
          placeholder="Valor pago"
        />
        <input
          className="customer-selector"
          type="date"
          value={paymentDate}
          onChange={(event) => setPaymentDate(event.target.value)}
        />
      </div>
      <div className="form-grid">
        <select className="customer-selector" value={method} onChange={(event) => setMethod(event.target.value as "CASH" | "PIX" | "CARD")}>
          <option value="PIX">PIX</option>
          <option value="CASH">Dinheiro</option>
          <option value="CARD">Cartao</option>
        </select>
        <input className="customer-selector" value={notes} onChange={(event) => setNotes(event.target.value)} />
      </div>
      <button className="auth-button" type="submit" disabled={loading}>
        {loading ? "Salvando..." : "Registrar pagamento"}
      </button>
      {error ? <div className="error-copy">{error}</div> : null}
    </form>
  );
}
