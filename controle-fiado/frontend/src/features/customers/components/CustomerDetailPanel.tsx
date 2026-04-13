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

function getNextDueDate(customer: CustomerDetail) {
  const activeSales = customer.sales.filter((sale) => sale.remainingAmount > 0);

  if (!activeSales.length) {
    return null;
  }

  return activeSales
    .map((sale) => new Date(sale.dueDate))
    .sort((left, right) => left.getTime() - right.getTime())[0];
}

type CustomerDetailPanelProps = {
  customer: CustomerDetail;
  selectedCustomerId: string;
  onCustomerChange: (customerId: string) => void;
  options: Array<{ id: string; name: string }>;
  canViewPayments?: boolean;
};

export function CustomerDetailPanel({
  customer,
  selectedCustomerId,
  onCustomerChange,
  options,
  canViewPayments = true
}: CustomerDetailPanelProps) {
  const openSalesCount = customer.sales.filter((sale) => sale.remainingAmount > 0).length;
  const overdueSalesCount = customer.sales.filter((sale) => sale.status === "OVERDUE" && sale.remainingAmount > 0).length;
  const nextDueDate = getNextDueDate(customer);

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
          <div>
            <span className="label">Titulos em aberto</span>
            <strong>{openSalesCount}</strong>
          </div>
          <div>
            <span className="label">Em atraso</span>
            <strong>{overdueSalesCount}</strong>
          </div>
          <div>
            <span className="label">Proximo vencimento</span>
            <strong>{nextDueDate ? formatDate(nextDueDate.toISOString()) : "Sem vencimento pendente"}</strong>
          </div>
        </div>

        <div className="detail-columns">
          <div className="detail-column">
            <div className="eyebrow">Vendas</div>
            {customer.sales.map((sale) => {
              const paidAmount = Math.max(sale.finalAmount - sale.remainingAmount, 0);

              return (
                <article key={sale.id} className="statement-item">
                  <div className="statement-main">
                    <strong>{sale.description}</strong>
                    <span>{formatMoney(sale.finalAmount)}</span>
                  </div>
                  <div className="customer-meta">
                    {formatDate(sale.saleDate)} | vence {formatDate(sale.dueDate)} | {sale.status}
                  </div>
                  <div className="statement-breakdown">
                    <div>
                      <span className="label">Valor total</span>
                      <strong>{formatMoney(sale.finalAmount)}</strong>
                    </div>
                    <div>
                      <span className="label">Pago</span>
                      <strong>{formatMoney(paidAmount)}</strong>
                    </div>
                    <div>
                      <span className="label">Em aberto</span>
                      <strong>{formatMoney(sale.remainingAmount)}</strong>
                    </div>
                  </div>
                  <div className={`sale-status-pill ${sale.status.toLowerCase()}`}>{sale.status}</div>
                </article>
              );
            })}
          </div>

          {canViewPayments ? (
            <div className="detail-column">
              <div className="eyebrow">Pagamentos</div>
              {customer.payments.map((payment) => (
                <article key={payment.id} className="statement-item">
                  <div className="statement-main">
                    <strong>{formatMoney(payment.amount)}</strong>
                    <span>{payment.method}</span>
                  </div>
                  <div className="customer-meta">
                    {formatDate(payment.paymentDate)} | {payment.allocations.length} alocacoes
                  </div>
                  {payment.allocations.length ? (
                    <div className="allocation-list">
                      {payment.allocations.map((allocation) => (
                        <div key={`${payment.id}-${allocation.saleId}`} className="allocation-item">
                          <span className="label">Venda {allocation.saleId.slice(0, 8)}</span>
                          <strong>{formatMoney(allocation.amount)}</strong>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </article>
              ))}
            </div>
          ) : (
            <div className="detail-column">
              <div className="eyebrow">Pagamentos</div>
              <article className="statement-item">
                <div className="customer-meta">Visualizacao de pagamentos restrita ao perfil OWNER.</div>
              </article>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
