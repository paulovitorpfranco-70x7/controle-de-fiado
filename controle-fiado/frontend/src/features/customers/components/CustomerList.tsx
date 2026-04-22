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
    <section className="card-list customer-results-list">
      {customers.map((customer) => {
        const isSelected = selectedCustomerId === customer.id;
        const overdueCount = customer.overdueSalesCount ?? 0;
        const statusLabel = !customer.isActive
          ? "Inativo"
          : overdueCount > 0
            ? `${overdueCount} atraso(s)`
            : customer.openBalance > 0
              ? "Com saldo"
              : "Em dia";

        return (
          <article
            key={customer.id}
            className={`customer-card selectable-card customer-row-card ${isSelected ? "selected" : ""}`}
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
            <div className="customer-main customer-main-lean">
              <div className="customer-card-copy">
                <div className="customer-name">{customer.name}</div>
                <div className="customer-meta">{customer.phone}</div>
                <div className="customer-inline-status">
                  <span className={`customer-tag ${!customer.isActive || overdueCount > 0 ? "warning" : customer.openBalance > 0 ? "neutral" : "success"}`}>
                    {statusLabel}
                  </span>
                </div>
              </div>

              <div className="customer-card-side customer-card-side-lean">
                <div className="customer-balance-block">
                  <span className="label">Saldo</span>
                  <strong>{formatMoney(customer.openBalance)}</strong>
                </div>
                <span className="customer-row-open-copy">Abrir detalhes</span>
              </div>
            </div>
          </article>
        );
      })}
    </section>
  );
}
