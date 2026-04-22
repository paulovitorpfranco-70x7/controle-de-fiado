import { X } from "lucide-react";
import { useMemo, useState } from "react";
import { addDaysInputDateValue, todayInputDateValue } from "../../../shared/utils/date-input";
import { createSale } from "../api/create-sale";
import type { SaleItem } from "../types/sale";
import { getSaleItemsTotal, normalizeSaleItemDraft } from "../utils/sale-items";

type CreateSaleFormProps = {
  customerId: string;
  customerName?: string;
  customerOptions?: Array<{ id: string; name: string }>;
  onCustomerChange?: (customerId: string) => void;
  createdById: string;
  onCreated: () => Promise<void> | void;
  onSuccess?: (message: string) => void;
  onCancel?: () => void;
};

export function CreateSaleForm({
  customerId,
  customerName,
  customerOptions = [],
  onCustomerChange,
  createdById,
  onCreated,
  onSuccess,
  onCancel
}: CreateSaleFormProps) {
  const [description, setDescription] = useState("Compra de balcao");
  const [saleItems, setSaleItems] = useState<Array<{ name: string; quantity: string; unitPrice: string }>>([createEmptySaleItem()]);
  const [originalAmount, setOriginalAmount] = useState("0");
  const [feePercent, setFeePercent] = useState("0");
  const [saleDate, setSaleDate] = useState(todayInputDateValue());
  const [dueDate, setDueDate] = useState(addDaysInputDateValue(15));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const projectedAmount = useMemo(() => {
    const baseAmount = Number(originalAmount) || 0;
    const fee = Number(feePercent) || 0;

    if (baseAmount <= 0) {
      return 0;
    }

    return baseAmount + (baseAmount * fee) / 100;
  }, [feePercent, originalAmount]);

  const saleItemsTotal = useMemo(
    () =>
      getSaleItemsTotal(
        saleItems.map((item) => ({
          name: item.name,
          quantity: Number(item.quantity),
          unitPrice: Number(item.unitPrice)
        }))
      ),
    [saleItems]
  );

  const projectedFeeAmount = Math.max(projectedAmount - (Number(originalAmount) || 0), 0);
  const daysUntilDue = getDateDiffInDays(saleDate, dueDate);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const normalizedSaleItems = getValidatedSaleItems(saleItems);

      await createSale({
        customerId,
        description,
        saleItems: normalizedSaleItems,
        originalAmount: Number(originalAmount),
        feePercent: Number(feePercent),
        saleDate,
        dueDate,
        createdById
      });

      setOriginalAmount("0");
      setFeePercent("0");
      setSaleItems([createEmptySaleItem()]);
      setSuccess("Venda registrada com sucesso.");
      onSuccess?.("Venda registrada com sucesso.");
      await onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao criar venda.");
    } finally {
      setLoading(false);
    }
  }

  function handleAddSaleItem() {
    setSaleItems((current) => [...current, createEmptySaleItem()]);
  }

  function handleRemoveSaleItem(index: number) {
    setSaleItems((current) => (current.length === 1 ? current : current.filter((_, itemIndex) => itemIndex !== index)));
  }

  function handleSaleItemChange(index: number, field: "name" | "quantity" | "unitPrice", value: string) {
    setSaleItems((current) => current.map((item, itemIndex) => (itemIndex === index ? { ...item, [field]: value } : item)));
  }

  return (
    <form className="operation-form" onSubmit={handleSubmit}>
      <div className="operation-header">
        <div>
          <div className="eyebrow">Nova venda</div>
          <h3 id="sale-create-title">Lancar fiado</h3>
        </div>
        {onCancel ? (
          <button className="floating-form-close" type="button" aria-label="Fechar formulario de venda" onClick={onCancel}>
            <X size={18} strokeWidth={2.2} />
          </button>
        ) : (
          <div className="operation-chip">{formatCurrency(projectedAmount)}</div>
        )}
      </div>

      {onCancel ? <div className="operation-chip operation-chip-inline">{formatCurrency(projectedAmount)}</div> : null}

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

      <label className="field-block">
        <span className="label">Descricao</span>
        <input
          className="customer-selector"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Ex.: compra do mes"
        />
      </label>

      <section className="field-block sale-items-shell">
        <div className="sale-items-head">
          <div>
            <span className="label">Itens vendidos</span>
            <div className="helper-copy">Registre os produtos para identificar a composicao da venda.</div>
          </div>
          <button className="ghost-button mini-inline-button" type="button" onClick={handleAddSaleItem}>
            Adicionar item
          </button>
        </div>

        <div className="sale-items-list">
          {saleItems.map((item, index) => (
            <div key={`sale-item-${index}`} className="sale-item-row">
              <input
                className="customer-selector"
                value={item.name}
                onChange={(event) => handleSaleItemChange(index, "name", event.target.value)}
                placeholder="Produto"
              />
              <input
                className="customer-selector"
                type="number"
                min="0.001"
                step="0.001"
                value={item.quantity}
                onChange={(event) => handleSaleItemChange(index, "quantity", event.target.value)}
                placeholder="Qtd."
              />
              <input
                className="customer-selector"
                type="number"
                min="0.01"
                step="0.01"
                value={item.unitPrice}
                onChange={(event) => handleSaleItemChange(index, "unitPrice", event.target.value)}
                placeholder="Valor unit."
              />
              <button
                className="ghost-button sale-item-remove"
                type="button"
                onClick={() => handleRemoveSaleItem(index)}
                disabled={saleItems.length === 1}
              >
                Remover
              </button>
            </div>
          ))}
        </div>

        <div className="sale-items-summary">
          <span>Total dos itens: {formatCurrency(saleItemsTotal)}</span>
          <button className="mini-chip-button" type="button" onClick={() => setOriginalAmount(String(saleItemsTotal || 0))}>
            Usar total dos itens
          </button>
        </div>
      </section>

      <div className="form-grid">
        <label className="field-block">
          <span className="label">Valor</span>
          <input
            className="customer-selector"
            type="number"
            min="0.01"
            step="0.01"
            value={originalAmount}
            onChange={(event) => setOriginalAmount(event.target.value)}
            placeholder="0,00"
          />
        </label>

        <label className="field-block">
          <span className="label">Acrescimo %</span>
          <input
            className="customer-selector"
            type="number"
            min="0"
            max="100"
            step="0.01"
            value={feePercent}
            onChange={(event) => setFeePercent(event.target.value)}
            placeholder="0"
          />
        </label>
      </div>

      <div className="form-grid">
        <label className="field-block">
          <span className="label">Data da venda</span>
          <input className="customer-selector" type="date" value={saleDate} onChange={(event) => setSaleDate(event.target.value)} />
        </label>

        <label className="field-block">
          <span className="label">Vencimento</span>
          <input className="customer-selector" type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} />
        </label>
      </div>

      <div className="operation-support-grid">
        <div className="support-card">
          <span className="label">Cliente atual</span>
          <strong>{customerName ?? "Sem cliente selecionado"}</strong>
        </div>
        <div className="support-card">
          <span className="label">Acrescimo previsto</span>
          <strong>{formatCurrency(projectedFeeAmount)}</strong>
        </div>
        <div className="support-card">
          <span className="label">Prazo</span>
          <strong>{daysUntilDue > 0 ? `${daysUntilDue} dia(s)` : "Vence hoje"}</strong>
        </div>
        <div className="support-card support-card-emphasis">
          <span className="label">Total previsto</span>
          <strong>{formatCurrency(projectedAmount)}</strong>
        </div>
      </div>

      <div className="inline-action-row">
        {[7, 15, 30].map((days) => (
          <button
            key={days}
            className={`mini-chip-button ${daysUntilDue === days ? "active" : ""}`}
            type="button"
            onClick={() => setDueDate(addDaysInputDateValue(days))}
          >
            {`${days} dias`}
          </button>
        ))}
      </div>

      <button className="auth-button" type="submit" disabled={loading}>
        {loading ? "Salvando..." : "Registrar venda"}
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

function getDateDiffInDays(startValue: string, endValue: string) {
  const start = new Date(`${startValue}T00:00:00`);
  const end = new Date(`${endValue}T00:00:00`);
  const diff = end.getTime() - start.getTime();

  return Number.isNaN(diff) ? 0 : Math.max(Math.round(diff / 86400000), 0);
}

function createEmptySaleItem() {
  return {
    name: "",
    quantity: "",
    unitPrice: ""
  };
}

function getValidatedSaleItems(items: Array<{ name: string; quantity: string; unitPrice: string }>): SaleItem[] {
  const hasIncompleteRow = items.some((item) => {
    const hasAnyValue = item.name.trim() || item.quantity.trim() || item.unitPrice.trim();
    const isComplete = item.name.trim() && Number(item.quantity) > 0 && Number(item.unitPrice) > 0;

    return Boolean(hasAnyValue) && !isComplete;
  });

  if (hasIncompleteRow) {
    throw new Error("Preencha nome, quantidade e valor unitario do item ou remova a linha incompleta.");
  }

  return normalizeSaleItemDraft(
    items.map((item) => ({
      name: item.name,
      quantity: Number(item.quantity),
      unitPrice: Number(item.unitPrice)
    }))
  );
}
