import { X } from "lucide-react";
import { useState } from "react";
import { updateCustomer } from "../api/update-customer";
import type { CustomerDetail } from "../types/customer-detail";

type EditCustomerFormProps = {
  customer: CustomerDetail;
  onUpdated: () => Promise<void> | void;
  onSuccess?: (message: string) => void;
  onCancel?: () => void;
};

export function EditCustomerForm({ customer, onUpdated, onSuccess, onCancel }: EditCustomerFormProps) {
  const [name, setName] = useState(customer.name);
  const [phone, setPhone] = useState(customer.phone);
  const [address, setAddress] = useState(customer.address ?? "");
  const [creditLimit, setCreditLimit] = useState(customer.creditLimit ? String(customer.creditLimit) : "");
  const [notes, setNotes] = useState(customer.notes ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await updateCustomer(customer.id, {
        name,
        phone,
        address: address || undefined,
        creditLimit: creditLimit ? Number(creditLimit) : undefined,
        notes: notes || undefined
      });

      onSuccess?.("Cliente atualizado com sucesso.");
      await onUpdated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao atualizar cliente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="operation-form" onSubmit={handleSubmit}>
      <div className="operation-header">
        <div>
          <div className="eyebrow">Editar cliente</div>
          <h3 id="customer-edit-title">Atualizar cadastro</h3>
        </div>
        {onCancel ? (
          <button className="floating-form-close" type="button" aria-label="Fechar edicao de cliente" onClick={onCancel}>
            <X size={18} strokeWidth={2.2} />
          </button>
        ) : null}
      </div>

      <label className="field-block">
        <span className="label">Nome</span>
        <input className="customer-selector" value={name} onChange={(event) => setName(event.target.value)} placeholder="Nome do cliente" />
      </label>

      <div className="form-grid">
        <label className="field-block">
          <span className="label">Telefone</span>
          <input className="customer-selector" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="Telefone" />
        </label>
        <label className="field-block">
          <span className="label">Limite de credito</span>
          <input
            className="customer-selector"
            type="number"
            min="0"
            step="0.01"
            value={creditLimit}
            onChange={(event) => setCreditLimit(event.target.value)}
            placeholder="0,00"
          />
        </label>
      </div>

      <label className="field-block">
        <span className="label">Endereco</span>
        <input className="customer-selector" value={address} onChange={(event) => setAddress(event.target.value)} placeholder="Endereco" />
      </label>

      <label className="field-block">
        <span className="label">Observacoes</span>
        <textarea
          className="message-textarea compact-textarea"
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          placeholder="Preferencias, apelido, melhor horario ou instrucoes uteis"
        />
      </label>

      <button className="auth-button" type="submit" disabled={loading}>
        {loading ? "Salvando..." : "Salvar alteracoes"}
      </button>

      {error ? <div className="operation-notice error">{error}</div> : null}
    </form>
  );
}
