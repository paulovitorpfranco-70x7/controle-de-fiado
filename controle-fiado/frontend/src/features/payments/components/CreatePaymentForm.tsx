import { useMemo, useState } from "react";
import { todayInputDateValue } from "../../../shared/utils/date-input";
import type { Sale } from "../../sales/types/sale";
import { createPayment } from "../api/create-payment";

type CreatePaymentFormProps = {
  customerId: string;
  customerName?: string;
  customerOptions?: Array<{ id: string; name: string }>;
  onCustomerChange?: (customerId: string) => void;
  createdById: string;
  openSales?: Sale[];
  onCreated: () => Promise<void> | void;
  onSuccess?: (message: string) => void;
};

export function CreatePaymentForm({
  customerId,
  customerName,
  customerOptions = [],
  onCustomerChange,
  createdById,
  openSales = [],
  onCreated,
  onSuccess
}: CreatePaymentFormProps) {
  const [amount, setAmount] = useState("0");
  const [paymentDate, setPaymentDate] = useState(todayInputDateValue());
  const [method, setMethod] = useState<"CASH" | "PIX" | "CARD">("PIX");
  const [targetSaleId, setTargetSaleId] = useState("");
  const [notes, setNotes] = useState("Pagamento registrado no caixa.");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const selectedSale = useMemo(() => openSales.find((sale) => sale.id === targetSaleId) ?? null, [openSales, targetSaleId]);

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
      <div className="operation-header">
        <div>
          <div className="eyebrow">Novo pagamento</div>
          <h3>Receber valor</h3>
        </div>
        <div className="operation-chip">{formatCurrency(Number(amount) || 0)}</div>
      </div>

      <label className="field-block">
        <span className="label">Cliente</span>
        <select
          className="customer-selector"
          value={customerId}
          onChange={(event) => onCustomerChange?.(event.target.value)}
          disabled={!onCustomerChange || customerOptions.length === 0}
        >
          {customerOptions.length ? (
            customerOptions.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.name}
              </option>
            ))
          ) : (
            <option value={customerId}>{customerName ?? customerId}</option>
          )}
        </select>
      </label>

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
            placeholder="0,00"
          />
        </label>

        <label className="field-block">
          <span className="label">Data</span>
          <input className="customer-selector" type="date" value={paymentDate} onChange={(event) => setPaymentDate(event.target.value)} />
        </label>
      </div>

      <div className="form-grid">
        <label className="field-block">
          <span className="label">Forma</span>
          <select className="customer-selector" value={method} onChange={(event) => setMethod(event.target.value as "CASH" | "PIX" | "CARD")}>
            <option value="PIX">PIX</option>
            <option value="CASH">Dinheiro</option>
            <option value="CARD">Cartao</option>
          </select>
        </label>

        <label className="field-block">
          <span className="label">Aplicacao</span>
          <select className="customer-selector" value={targetSaleId} onChange={(event) => setTargetSaleId(event.target.value)}>
            <option value="">Rateio automatico</option>
            {openSales.map((sale) => (
              <option key={sale.id} value={sale.id}>
                {`${sale.description} | vence ${formatDate(sale.dueDate)} | aberto ${formatCurrency(sale.remainingAmount)}`}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="field-block">
        <span className="label">Observacao</span>
        <input className="customer-selector" value={notes} onChange={(event) => setNotes(event.target.value)} />
      </label>

      <div className="operation-support-grid">
        <div className="support-card">
          <span className="label">Cliente atual</span>
          <strong>{customerName ?? "Sem cliente selecionado"}</strong>
        </div>
        <div className="support-card">
          <span className="label">Destino</span>
          <strong>{selectedSale ? selectedSale.description : "Rateio automatico nas vendas em aberto"}</strong>
        </div>
      </div>

      {targetSaleId ? (
        <div className="message-copy">O sistema quita primeiro a venda escolhida e distribui o restante, se houver.</div>
      ) : null}
      {!targetSaleId ? <div className="message-copy">Sem escolha manual, o valor sera aplicado nas vendas mais antigas.</div> : null}
      {openSales.length === 0 ? <div className="message-copy">Este cliente nao possui vendas em aberto para direcionamento manual.</div> : null}

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
