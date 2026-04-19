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
      {customers.map((customer) => {
        const isSelected = selectedCustomerId === customer.id;
        const overdueCount = customer.overdueSalesCount ?? 0;

        return (
          <article
            key={customer.id}
            className={`customer-card selectable-card customer-list-card ${isSelected ? "selected" : ""}`}
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
              <div className="customer-card-copy">
                <div className="customer-name">{customer.name}</div>
                <div className="customer-meta">{customer.phone}</div>
                <div className="customer-card-tags">
                  {overdueCount > 0 ? <span className="customer-tag warning">{overdueCount} atraso(s)</span> : null}
                </div>
              </div>
              <div className="customer-card-side">
                <div className="customer-balance-block">
                  <span className="label">Saldo</span>
                  <strong>{formatMoney(customer.openBalance)}</strong>
                </div>
                <div className="customer-card-tags">
                  <span className={customer.openBalance > 0 ? "badge warning" : "badge success"}>{customer.openBalance > 0 ? "Com saldo" : "Em dia"}</span>
                  {isSelected ? <span className="selection-chip">Em foco</span> : null}
                </div>
              </div>
            </div>
          </article>
        );
      })}
    </section>
  );
}
