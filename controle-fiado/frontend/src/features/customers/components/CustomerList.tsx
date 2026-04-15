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
  if (!customers.length) {
    return <div className="empty-card">Nenhum cliente encontrado para os filtros atuais.</div>;
  }

  return (
    <section className="card-list">
      {customers.map((customer) => (
        <article
          key={customer.id}
          className={`customer-card selectable-card ${selectedCustomerId === customer.id ? "selected" : ""}`}
          role={onSelectCustomer ? "button" : undefined}
          tabIndex={onSelectCustomer ? 0 : undefined}
          onClick={() => onSelectCustomer?.(customer.id)}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              onSelectCustomer?.(customer.id);
            }
          }}
        >
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
            <div className="selection-hint">{selectedCustomerId === customer.id ? "Cliente selecionado" : "Clique para abrir a ficha"}</div>
          ) : null}
        </article>
      ))}
    </section>
  );
}
