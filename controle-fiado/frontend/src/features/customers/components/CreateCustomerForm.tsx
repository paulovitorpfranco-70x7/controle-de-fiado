import { useState } from "react";
import { createCustomer } from "../api/create-customer";
import type { Customer } from "../types/customer";

type CreateCustomerFormProps = {
  onCreated: (customer: Customer) => Promise<void> | void;
  onSuccess?: (message: string) => void;
};

export function CreateCustomerForm({ onCreated, onSuccess }: CreateCustomerFormProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [creditLimit, setCreditLimit] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const customer = await createCustomer({
        name,
        phone,
        address: address || undefined,
        creditLimit: creditLimit ? Number(creditLimit) : undefined,
        notes: notes || undefined
      });

      setName("");
      setPhone("");
      setAddress("");
      setCreditLimit("");
      setNotes("");
      setSuccess("Cliente cadastrado com sucesso.");
      onSuccess?.("Cliente cadastrado com sucesso.");
      await onCreated(customer);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao criar cliente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="operation-form" onSubmit={handleSubmit}>
      <div className="operation-header">
        <div>
          <div className="eyebrow">Novo cliente</div>
          <h3>Cadastrar cliente</h3>
        </div>
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
        <input className="customer-selector" value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Observacoes" />
      </label>

      <button className="auth-button" type="submit" disabled={loading}>
        {loading ? "Salvando..." : "Cadastrar cliente"}
      </button>

      {success ? <div className="operation-notice success">{success}</div> : null}
      {error ? <div className="operation-notice error">{error}</div> : null}
    </form>
  );
}
