import type { Customer } from "../types/customer";

function formatMoney(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  }).format(value);
}

type CustomerListProps = {
  customers: Customer[];
  selectedCustomerId?: string;
  onSelectCustomer?: (customerId: string) => void;
};

export function CustomerList({ customers, selectedCustomerId, onSelectCustomer }: CustomerListProps) {
  return (
    <section className="card-list">
      {customers.map((customer) => (
        <article key={customer.id} className={`customer-card selectable-card ${selectedCustomerId === customer.id ? "selected" : ""}`}>
          <div className="customer-main">
            <div>
              <div className="customer-name">{customer.name}</div>
              <div className="customer-meta">{customer.phone}</div>
            </div>
            <div className={customer.openBalance > 0 ? "badge warning" : "badge success"}>
              {customer.openBalance > 0 ? "Em aberto" : "Sem saldo"}
            </div>
          </div>
          <div className="customer-grid">
            <div>
              <span className="label">Saldo</span>
              <strong>{formatMoney(customer.openBalance)}</strong>
            </div>
            <div>
              <span className="label">Limite</span>
              <strong>{customer.creditLimit ? formatMoney(customer.creditLimit) : "Nao definido"}</strong>
            </div>
            <div>
              <span className="label">Endereco</span>
              <strong>{customer.address ?? "Nao informado"}</strong>
            </div>
          </div>
          {onSelectCustomer ? (
            <button className="ghost-button" type="button" onClick={() => onSelectCustomer(customer.id)}>
              {selectedCustomerId === customer.id ? "Cliente selecionado" : "Selecionar cliente"}
            </button>
          ) : null}
        </article>
      ))}
    </section>
  );
}
