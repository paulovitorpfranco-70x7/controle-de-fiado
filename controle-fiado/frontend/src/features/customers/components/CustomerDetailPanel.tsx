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

function formatLongDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "medium"
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

function getSaleStatusLabel(status: string) {
  const labels: Record<string, string> = {
    OPEN: "Em aberto",
    PARTIAL: "Parcial",
    OVERDUE: "Em atraso",
    PAID: "Pago"
  };

  return labels[status] ?? status;
}

type CustomerDetailPanelProps = {
  customer: CustomerDetail;
  canViewPayments?: boolean;
  onCreateSale?: () => void;
  onRegisterPayment?: () => void;
  onChargeCustomer?: () => void;
};

export function CustomerDetailPanel({
  customer,
  canViewPayments = true,
  onCreateSale,
  onRegisterPayment,
  onChargeCustomer
}: CustomerDetailPanelProps) {
  const openSales = customer.sales.filter((sale) => sale.remainingAmount > 0);
  const recentPayments = customer.payments.slice(0, 5);
  const openSalesCount = openSales.length;
  const overdueSalesCount = openSales.filter((sale) => sale.status === "OVERDUE").length;
  const nextDueDate = getNextDueDate(customer);

  return (
    <section className="section-block customer-detail-shell">
      <header className="customer-profile-hero">
        <div className="customer-profile-main">
          <div className="customer-profile-mark">{customer.name.slice(0, 1).toUpperCase()}</div>

          <div className="customer-profile-copy">
            <div className="eyebrow">Ficha do cliente</div>
            <h2>{customer.name}</h2>
            <div className="customer-profile-meta">
              <span>{customer.phone}</span>
              <span>{customer.isActive ? "Ativo" : "Inativo"}</span>
              <span>{customer.address ?? "Endereco nao informado"}</span>
            </div>
          </div>
        </div>

        <div className="customer-actions">
          {onCreateSale ? (
            <button className="auth-button compact-action-button" type="button" onClick={onCreateSale}>
              Nova venda
            </button>
          ) : null}
          {canViewPayments && onRegisterPayment ? (
            <button className="ghost-button" type="button" onClick={onRegisterPayment}>
              Novo pagamento
            </button>
          ) : null}
          {canViewPayments && onChargeCustomer ? (
            <button className="ghost-button" type="button" onClick={onChargeCustomer}>
              Abrir cobranca
            </button>
          ) : null}
        </div>
      </header>

      <section className="customer-stat-grid">
        <article className="customer-stat-card emphasis">
          <span className="label">Saldo atual</span>
          <strong>{formatMoney(customer.openBalance)}</strong>
        </article>
        <article className="customer-stat-card">
          <span className="label">Limite</span>
          <strong>{customer.creditLimit ? formatMoney(customer.creditLimit) : "Nao definido"}</strong>
        </article>
        <article className="customer-stat-card">
          <span className="label">Vendas em aberto</span>
          <strong>{openSalesCount}</strong>
        </article>
        <article className="customer-stat-card">
          <span className="label">Em atraso</span>
          <strong>{overdueSalesCount}</strong>
        </article>
      </section>

      <section className="customer-support-strip">
        <div className="support-card">
          <span className="label">Proximo vencimento</span>
          <strong>{nextDueDate ? formatDate(nextDueDate.toISOString()) : "Sem pendencia"}</strong>
        </div>
        <div className="support-card">
          <span className="label">Cliente desde</span>
          <strong>{formatLongDate(customer.createdAt)}</strong>
        </div>
        <div className="support-card">
          <span className="label">Observacao</span>
          <strong>{customer.notes ?? "Sem anotacoes para este cliente"}</strong>
        </div>
      </section>

      <section className="customer-detail-columns">
        <article className="dashboard-chart-card customer-module">
          <div className="dashboard-card-head">
            <div>
              <div className="eyebrow">Vendas</div>
              <h3>Vendas em aberto</h3>
            </div>
          </div>

          <div className="customer-stream-list">
            {openSales.length ? (
              openSales.map((sale) => {
                const paidAmount = Math.max(sale.finalAmount - sale.remainingAmount, 0);
                const progress = sale.finalAmount > 0 ? Math.min((paidAmount / sale.finalAmount) * 100, 100) : 0;

                return (
                  <article key={sale.id} className="stream-card sale-stream-card">
                    <div className="stream-card-head">
                      <div className="stream-card-copy">
                        <div className="stream-kicker">Venda</div>
                        <div className="stream-title">{sale.description}</div>
                        <div className="customer-meta">
                          {formatDate(sale.saleDate)} | vence {formatDate(sale.dueDate)}
                        </div>
                      </div>
                      <div className={`sale-status-pill ${sale.status.toLowerCase()}`}>{getSaleStatusLabel(sale.status)}</div>
                    </div>

                    <div className="stream-progress">
                      <div className="stream-progress-bar">
                        <span className="stream-progress-fill sales" style={{ width: `${Math.max(progress, 6)}%` }} />
                      </div>
                      <div className="stream-progress-meta">
                        <span>{formatMoney(paidAmount)} pago</span>
                        <span>{formatMoney(sale.remainingAmount)} em aberto</span>
                      </div>
                    </div>

                    <div className="stream-metrics-grid">
                      <div>
                        <span className="label">Total</span>
                        <strong>{formatMoney(sale.finalAmount)}</strong>
                      </div>
                      <div>
                        <span className="label">Acrescimo</span>
                        <strong>{formatMoney(sale.feeAmount)}</strong>
                      </div>
                      <div>
                        <span className="label">Codigo</span>
                        <strong>{sale.id.slice(0, 8)}</strong>
                      </div>
                    </div>
                  </article>
                );
              })
            ) : (
              <div className="empty-card">Nenhuma venda em aberto para este cliente.</div>
            )}
          </div>
        </article>

        <article className="dashboard-chart-card customer-module">
          <div className="dashboard-card-head">
            <div>
              <div className="eyebrow">Pagamentos</div>
              <h3>Pagamentos recentes</h3>
            </div>
          </div>

          {canViewPayments ? (
            <div className="customer-stream-list">
              {recentPayments.length ? (
                recentPayments.map((payment) => {
                  const allocatedAmount = payment.allocations.reduce((total, allocation) => total + allocation.amount, 0);
                  const progress = payment.amount > 0 ? Math.min((allocatedAmount / payment.amount) * 100, 100) : 0;

                  return (
                    <article key={payment.id} className="stream-card payment-stream-card">
                      <div className="stream-card-head">
                        <div className="stream-card-copy">
                          <div className="stream-kicker">Pagamento</div>
                          <div className="stream-title">{formatMoney(payment.amount)}</div>
                          <div className="customer-meta">
                            {formatDate(payment.paymentDate)} | {payment.method}
                          </div>
                        </div>
                        <div className="badge success">{payment.allocations.length} aloc.</div>
                      </div>

                      <div className="stream-progress">
                        <div className="stream-progress-bar">
                          <span className="stream-progress-fill payments" style={{ width: `${Math.max(progress, 6)}%` }} />
                        </div>
                        <div className="stream-progress-meta">
                          <span>{formatMoney(allocatedAmount)} alocado</span>
                          <span>{formatMoney(Math.max(payment.amount - allocatedAmount, 0))} livre</span>
                        </div>
                      </div>

                      <div className="payment-allocation-grid">
                        {payment.allocations.length ? (
                          payment.allocations.map((allocation) => (
                            <div key={`${payment.id}-${allocation.saleId}`} className="allocation-item">
                              <span className="label">Venda {allocation.saleId.slice(0, 8)}</span>
                              <strong>{formatMoney(allocation.amount)}</strong>
                            </div>
                          ))
                        ) : (
                          <div className="customer-meta">Pagamento sem alocacoes detalhadas.</div>
                        )}
                      </div>
                    </article>
                  );
                })
              ) : (
                <div className="empty-card">Nenhum pagamento recente para este cliente.</div>
              )}
            </div>
          ) : (
            <div className="empty-card">Visualizacao de pagamentos restrita ao perfil OWNER.</div>
          )}
        </article>
      </section>
    </section>
  );
}
