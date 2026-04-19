import { X } from "lucide-react";
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
  isCompactMobile?: boolean;
  onClose?: () => void;
};

export function CustomerDetailPanel({
  customer,
  canViewPayments = true,
  onCreateSale,
  onRegisterPayment,
  onChargeCustomer,
  isCompactMobile = false,
  onClose
}: CustomerDetailPanelProps) {
  const openSales = customer.sales.filter((sale) => sale.remainingAmount > 0);
  const recentPayments = customer.payments.slice(0, 5);
  const openSalesCount = openSales.length;
  const overdueSalesCount = openSales.filter((sale) => sale.status === "OVERDUE").length;
  const nextDueDate = getNextDueDate(customer);
  const showPaymentAction = canViewPayments && onRegisterPayment && customer.openBalance > 0;
  const showChargeAction = canViewPayments && onChargeCustomer && customer.openBalance > 0;
  const mobilePayments = recentPayments.slice(0, 3);

  return (
    <section className={`section-block customer-detail-shell ${isCompactMobile ? "customer-detail-shell-mobile" : ""}`}>
      <header className={`customer-profile-hero ${isCompactMobile ? "customer-profile-hero-mobile" : ""}`}>
        <div className="customer-profile-top">
          <div className="customer-profile-main">
            <div className="customer-profile-mark">{customer.name.slice(0, 1).toUpperCase()}</div>

            <div className="customer-profile-copy">
              <div className="eyebrow">Ficha do cliente</div>
              <h2 id={isCompactMobile ? "customer-mobile-title" : undefined}>{customer.name}</h2>
              <div className="customer-profile-meta">
                <span>{customer.phone}</span>
                <span>{customer.isActive ? "Ativo" : "Inativo"}</span>
                {!isCompactMobile && customer.address ? <span>{customer.address}</span> : null}
              </div>
            </div>
          </div>

          <div className="customer-actions">
            {onClose ? (
              <button className="floating-form-close customer-detail-close" type="button" aria-label="Fechar ficha do cliente" onClick={onClose}>
                <X size={18} strokeWidth={2.2} />
              </button>
            ) : null}
            {onCreateSale ? (
              <button className="auth-button compact-action-button" type="button" onClick={onCreateSale}>
                Nova venda
              </button>
            ) : null}
            {showPaymentAction ? (
              <button className="ghost-button" type="button" onClick={onRegisterPayment}>
                Registrar pagamento
              </button>
            ) : null}
            {showChargeAction ? (
              <button className="ghost-button" type="button" onClick={onChargeCustomer}>
                Cobrar
              </button>
            ) : null}
          </div>
        </div>

        <section className={`customer-summary-strip ${isCompactMobile ? "customer-summary-strip-mobile" : ""}`}>
          <article className="customer-stat-card emphasis">
            <span className="label">Saldo atual</span>
            <strong>{formatMoney(customer.openBalance)}</strong>
          </article>
          <article className="customer-stat-card">
            <span className="label">Vendas em aberto</span>
            <strong>{openSalesCount}</strong>
          </article>
          <article className="customer-stat-card">
            <span className="label">Em atraso</span>
            <strong>{overdueSalesCount}</strong>
          </article>
          <article className="customer-stat-card">
            <span className="label">Proximo vencimento</span>
            <strong>{nextDueDate ? formatDate(nextDueDate.toISOString()) : "Sem pendencia"}</strong>
          </article>
          {!isCompactMobile && customer.creditLimit ? (
            <article className="customer-stat-card">
              <span className="label">Limite</span>
              <strong>{formatMoney(customer.creditLimit)}</strong>
            </article>
          ) : null}
          {!isCompactMobile && customer.notes ? (
            <article className="customer-stat-card customer-note-card">
              <span className="label">Observacao</span>
              <strong>{customer.notes}</strong>
            </article>
          ) : null}
        </section>
      </header>

      <article className={`dashboard-chart-card customer-activity-panel ${isCompactMobile ? "customer-activity-panel-mobile" : ""}`}>
        <div className="customer-activity-group">
          <div className="dashboard-card-head">
            <div>
              <div className="eyebrow">Pendencias</div>
              <h3>O que este cliente deve</h3>
            </div>
          </div>

          <div className="customer-stream-list">
            {openSales.length ? (
              openSales.map((sale) => (
                <article key={sale.id} className="compact-stream-card">
                  <div className="compact-stream-head">
                    <div className="compact-stream-copy">
                      <div className="stream-kicker">{getSaleStatusLabel(sale.status)}</div>
                      <div className="compact-stream-title-row">
                        <strong className="compact-stream-title">{sale.description}</strong>
                        <strong className="compact-stream-amount">{formatMoney(sale.remainingAmount)}</strong>
                      </div>
                      <div className="compact-stream-meta">
                        <span>Venda {formatDate(sale.saleDate)}</span>
                        <span>Vence {formatDate(sale.dueDate)}</span>
                        <span>Total {formatMoney(sale.finalAmount)}</span>
                      </div>
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <div className="empty-card">Nenhuma venda em aberto para este cliente.</div>
            )}
          </div>
        </div>

        {!isCompactMobile ? (
          <div className="customer-activity-group">
            <div className="dashboard-card-head">
              <div>
                <div className="eyebrow">Pagamentos</div>
                <h3>Ultimos recebimentos</h3>
              </div>
            </div>

            {canViewPayments ? (
              <div className="customer-stream-list">
                {recentPayments.length ? (
                  recentPayments.map((payment) => (
                    <article key={payment.id} className="compact-stream-card">
                      <div className="compact-stream-head">
                        <div className="compact-stream-copy">
                          <div className="stream-kicker">Pagamento</div>
                          <div className="compact-stream-title-row">
                            <strong className="compact-stream-title">{formatDate(payment.paymentDate)}</strong>
                            <strong className="compact-stream-amount">{formatMoney(payment.amount)}</strong>
                          </div>
                          <div className="compact-stream-meta">
                            <span>{payment.method}</span>
                            <span>{payment.allocations.length} alocacao(oes)</span>
                          </div>
                        </div>
                      </div>
                    </article>
                  ))
                ) : (
                  <div className="empty-card">Nenhum pagamento recente para este cliente.</div>
                )}
              </div>
            ) : (
              <div className="empty-card">Visualizacao de pagamentos restrita ao perfil OWNER.</div>
            )}
          </div>
        ) : null}

        {isCompactMobile && canViewPayments && mobilePayments.length ? (
          <div className="dashboard-card-head">
            <div>
              <div className="eyebrow">Ultimo recebimento</div>
              <h3>{formatDate(mobilePayments[0].paymentDate)}</h3>
            </div>
            <strong className="compact-stream-amount">{formatMoney(mobilePayments[0].amount)}</strong>
          </div>
        ) : null}
      </article>
    </section>
  );
}
