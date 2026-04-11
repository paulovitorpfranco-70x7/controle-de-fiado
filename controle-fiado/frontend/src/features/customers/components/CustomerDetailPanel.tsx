import type { CustomerDetail } from "../types/customer-detail";

function formatMoney(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  }).format(value);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short"
  }).format(new Date(value));
}

type CustomerDetailPanelProps = {
  customer: CustomerDetail;
  selectedCustomerId: string;
  onCustomerChange: (customerId: string) => void;
  options: Array<{ id: string; name: string }>;
};

export function CustomerDetailPanel({
  customer,
  selectedCustomerId,
  onCustomerChange,
  options
}: CustomerDetailPanelProps) {
  return (
    <section className="section-block">
      <div className="customer-card">
        <div className="page-header page-header-section">
          <div>
            <div className="eyebrow">Ficha do cliente</div>
            <h2>{customer.name}</h2>
          </div>
          <select
            className="customer-selector"
            value={selectedCustomerId}
            onChange={(event) => onCustomerChange(event.target.value)}
          >
            {options.map((option) => (
              <option key={option.id} value={option.id}>
                {option.name}
              </option>
            ))}
          </select>
        </div>

        <div className="customer-grid">
          <div>
            <span className="label">Saldo atual</span>
            <strong>{formatMoney(customer.openBalance)}</strong>
          </div>
          <div>
            <span className="label">Limite</span>
            <strong>{customer.creditLimit ? formatMoney(customer.creditLimit) : "Nao definido"}</strong>
          </div>
          <div>
            <span className="label">Telefone</span>
            <strong>{customer.phone}</strong>
          </div>
        </div>

        <div className="detail-columns">
          <div className="detail-column">
            <div className="eyebrow">Vendas</div>
            {customer.sales.map((sale) => (
              <article key={sale.id} className="statement-item">
                <div className="statement-main">
                  <strong>{sale.description}</strong>
                  <span>{formatMoney(sale.remainingAmount)}</span>
                </div>
                <div className="customer-meta">
                  {formatDate(sale.saleDate)} · vence {formatDate(sale.dueDate)} · {sale.status}
                </div>
              </article>
            ))}
          </div>

          <div className="detail-column">
            <div className="eyebrow">Pagamentos</div>
            {customer.payments.map((payment) => (
              <article key={payment.id} className="statement-item">
                <div className="statement-main">
                  <strong>{formatMoney(payment.amount)}</strong>
                  <span>{payment.method}</span>
                </div>
                <div className="customer-meta">
                  {formatDate(payment.paymentDate)} · {payment.allocations.length} alocacoes
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
