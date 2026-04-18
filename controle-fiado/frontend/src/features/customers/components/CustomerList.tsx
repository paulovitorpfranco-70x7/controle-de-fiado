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
                  {customer.creditLimit ? <span className="customer-tag">Limite {formatMoney(customer.creditLimit)}</span> : null}
                  {overdueCount > 0 ? <span className="customer-tag warning">{overdueCount} atraso(s)</span> : null}
                </div>
              </div>
              <div className="customer-card-side">
                <div className={customer.openBalance > 0 ? "badge warning" : "badge success"}>{customer.openBalance > 0 ? "Com saldo" : "Em dia"}</div>
                {isSelected ? <div className="selection-chip">Ficha aberta</div> : null}
              </div>
            </div>

            <div className="customer-list-stats customer-list-stats-expanded">
              <div>
                <span className="label">Saldo</span>
                <strong>{formatMoney(customer.openBalance)}</strong>
              </div>
              <div>
                <span className="label">Atrasos</span>
                <strong>{overdueCount}</strong>
              </div>
              <div>
                <span className="label">Limite</span>
                <strong>{customer.creditLimit ? formatMoney(customer.creditLimit) : "Livre"}</strong>
              </div>
            </div>

            {onSelectCustomer ? <div className="selection-hint">{isSelected ? "Cliente em foco para venda, pagamento e cobranca." : "Toque para abrir a ficha e operar este cliente."}</div> : null}
          </article>
        );
      })}
    </section>
  );
}
