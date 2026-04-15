import { useState } from "react";
import { createPayment } from "../api/create-payment";
import { todayInputDateValue } from "../../../shared/utils/date-input";
import type { Sale } from "../../sales/types/sale";

type CreatePaymentFormProps = {
  customerId: string;
  customerName?: string;
  createdById: string;
  openSales?: Sale[];
  onCreated: () => Promise<void> | void;
  onSuccess?: (message: string) => void;
};

export function CreatePaymentForm({ customerId, customerName, createdById, openSales = [], onCreated, onSuccess }: CreatePaymentFormProps) {
  const [amount, setAmount] = useState("0");
  const [paymentDate, setPaymentDate] = useState(todayInputDateValue());
  const [method, setMethod] = useState<"CASH" | "PIX" | "CARD">("PIX");
  const [targetSaleId, setTargetSaleId] = useState("");
  const [notes, setNotes] = useState("Pagamento registrado no caixa.");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await createPayment({
        customerId,
        amount: Number(amount),
        paymentDate,
        method,
        notes,
        createdById,
        targetSaleId: targetSaleId || null
      });
      setAmount("0");
      setTargetSaleId("");
      setSuccess("Pagamento registrado com sucesso.");
      onSuccess?.("Pagamento registrado com sucesso.");
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
      <div className="customer-meta">Cliente selecionado: {customerName ?? customerId}</div>
      <div className="form-grid">
        <label className="field-block">
          <span className="label">Valor pago</span>
          <input
            className="customer-selector"
            type="number"
            min="0.01"
            step="0.01"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            placeholder="Valor pago"
          />
        </label>
        <label className="field-block">
          <span className="label">Data do pagamento</span>
          <input
            className="customer-selector"
            type="date"
            value={paymentDate}
            onChange={(event) => setPaymentDate(event.target.value)}
          />
        </label>
      </div>
      <div className="form-grid">
        <label className="field-block">
          <span className="label">Forma de pagamento</span>
          <select className="customer-selector" value={method} onChange={(event) => setMethod(event.target.value as "CASH" | "PIX" | "CARD")}>
            <option value="PIX">PIX</option>
            <option value="CASH">Dinheiro</option>
            <option value="CARD">Cartao</option>
          </select>
        </label>
        <label className="field-block">
          <span className="label">Aplicar em</span>
          <select className="customer-selector" value={targetSaleId} onChange={(event) => setTargetSaleId(event.target.value)}>
            <option value="">Rateio automatico nas mais antigas</option>
            {openSales.map((sale) => (
              <option key={sale.id} value={sale.id}>
                {`${sale.description} | vence ${formatDate(sale.dueDate)} | aberto ${formatCurrency(sale.remainingAmount)}`}
              </option>
            ))}
          </select>
        </label>
      </div>
      <label className="field-block">
        <span className="label">Observacoes</span>
        <input className="customer-selector" value={notes} onChange={(event) => setNotes(event.target.value)} />
      </label>
      {targetSaleId ? <div className="message-copy">O sistema vai quitar primeiro o titulo escolhido. Se sobrar valor, o restante sera rateado nas outras vendas em aberto.</div> : null}
      {!targetSaleId ? <div className="message-copy">Sem escolha manual, o pagamento continua sendo rateado automaticamente nas vendas mais antigas.</div> : null}
      {openSales.length === 0 ? <div className="message-copy">Este cliente nao possui titulos em aberto para direcionar manualmente.</div> : null}
      <button className="auth-button" type="submit" disabled={loading}>
        {loading ? "Salvando..." : "Registrar pagamento"}
      </button>
      {success ? <div className="success-copy">{success}</div> : null}
      {error ? <div className="error-copy">{error}</div> : null}
    </form>
  );
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  }).format(value);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR").format(new Date(value));
}
