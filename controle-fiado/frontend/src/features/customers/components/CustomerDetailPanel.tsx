import { PencilLine, ReceiptText, ShieldAlert, Wallet, X } from "lucide-react";
import type { Sale } from "../../sales/types/sale";
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
  onEditCustomer?: () => void;
  onToggleActive?: () => void;
  onViewSaleItems?: (sale: Sale) => void;
  isCompactMobile?: boolean;
  onClose?: () => void;
};

export function CustomerDetailPanel({
  customer,
  canViewPayments = true,
  onCreateSale,
  onRegisterPayment,
  onChargeCustomer,
  onEditCustomer,
  onToggleActive,
  onViewSaleItems,
  isCompactMobile = false,
  onClose
}: CustomerDetailPanelProps) {
  const openSales = customer.sales.filter((sale) => sale.remainingAmount > 0);
  const recentPayments = customer.payments.slice(0, 4);
  const openSalesCount = openSales.length;
  const overdueSalesCount = openSales.filter((sale) => sale.status === "OVERDUE").length;
  const nextDueDate = getNextDueDate(customer);
  const showPaymentAction = canViewPayments && onRegisterPayment && customer.openBalance > 0;
  const showChargeAction = canViewPayments && onChargeCustomer && customer.openBalance > 0;

  return (
    <section className={`customer-drawer-panel ${isCompactMobile ? "customer-drawer-panel-mobile" : ""}`}>
      <header className="customer-drawer-header">
        <div className="customer-profile-main">
          <div className="customer-profile-mark">{customer.name.slice(0, 1).toUpperCase()}</div>

          <div className="customer-profile-copy">
            <div className="eyebrow">Detalhes do cliente</div>
            <h2 id={isCompactMobile ? "customer-mobile-title" : "customer-drawer-title"}>{customer.name}</h2>
            <div className="customer-profile-meta">
              <span>{customer.phone}</span>
              <span>{customer.isActive ? "Ativo" : "Inativo"}</span>
              {customer.address ? <span>{customer.address}</span> : null}
            </div>
          </div>
        </div>

        {onClose ? (
          <button className="floating-form-close customer-detail-close" type="button" aria-label="Fechar detalhes do cliente" onClick={onClose}>
            <X size={18} strokeWidth={2.2} />
          </button>
        ) : null}
      </header>

      <section className="customer-summary-strip customer-drawer-summary">
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
      </section>

      <section className="customer-drawer-actions">
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
        {onEditCustomer ? (
          <button className="ghost-button" type="button" onClick={onEditCustomer}>
            Editar cliente
          </button>
        ) : null}
      </section>

      <section className="customer-drawer-grid">
        <article className="dashboard-chart-card customer-drawer-card">
          <div className="dashboard-card-head">
            <div>
              <div className="eyebrow">Resumo</div>
              <h3>Informacoes operacionais</h3>
            </div>
          </div>

          <div className="customer-info-stack">
            <div className="customer-info-row">
              <Wallet size={16} />
              <span>{customer.creditLimit ? `Limite ${formatMoney(customer.creditLimit)}` : "Sem limite cadastrado"}</span>
            </div>
            <div className="customer-info-row">
              <ShieldAlert size={16} />
              <span>{customer.isActive ? "Cadastro ativo para operacao" : "Cadastro inativo"}</span>
            </div>
            <div className="customer-info-row">
              <ReceiptText size={16} />
              <span>{customer.notes?.trim() ? customer.notes : "Sem observacoes cadastradas."}</span>
            </div>
          </div>
        </article>

        <article className="dashboard-chart-card customer-drawer-card">
          <div className="dashboard-card-head">
            <div>
              <div className="eyebrow">Pendencias</div>
              <h3>Vendas em aberto</h3>
            </div>
          </div>

          <div className="customer-drawer-stream">
            {openSales.length ? (
              openSales.map((sale) => (
                <article key={sale.id} className="customer-sale-entry">
                  <div className="customer-sale-entry-head">
                    <div>
                      <div className="stream-kicker">{getSaleStatusLabel(sale.status)}</div>
                      <strong className="customer-sale-title">{sale.description}</strong>
                    </div>
                    <strong className="compact-stream-amount">{formatMoney(sale.remainingAmount)}</strong>
                  </div>

                  <div className="compact-stream-meta">
                    <span>Venda {formatDate(sale.saleDate)}</span>
                    <span>Vence {formatDate(sale.dueDate)}</span>
                    <span>Total {formatMoney(sale.finalAmount)}</span>
                  </div>

                  <div className="customer-sale-actions">
                    {sale.saleItems.length ? (
                      <button className="ghost-button mini-inline-button" type="button" onClick={() => onViewSaleItems?.(sale)}>
                        {`Itens (${sale.saleItems.length})`}
                      </button>
                    ) : null}
                  </div>
                </article>
              ))
            ) : (
              <div className="empty-card">Nenhuma venda em aberto para este cliente.</div>
            )}
          </div>
        </article>

        <article className="dashboard-chart-card customer-drawer-card">
          <div className="dashboard-card-head">
            <div>
              <div className="eyebrow">Pagamentos</div>
              <h3>Ultimos recebimentos</h3>
            </div>
          </div>

          {canViewPayments ? (
            <div className="customer-drawer-stream">
              {recentPayments.length ? (
                recentPayments.map((payment) => (
                  <article key={payment.id} className="customer-sale-entry">
                    <div className="customer-sale-entry-head">
                      <div>
                        <div className="stream-kicker">Pagamento</div>
                        <strong className="customer-sale-title">{formatDate(payment.paymentDate)}</strong>
                      </div>
                      <strong className="compact-stream-amount">{formatMoney(payment.amount)}</strong>
                    </div>
                    <div className="compact-stream-meta">
                      <span>{payment.method}</span>
                      <span>{payment.allocations.length} alocacao(oes)</span>
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
        </article>
      </section>

      <footer className="customer-drawer-footer">
        {onEditCustomer ? (
          <button className="ghost-button" type="button" onClick={onEditCustomer}>
            <PencilLine size={16} />
            Editar cadastro
          </button>
        ) : null}
        {onToggleActive ? (
          <button className="ghost-button danger" type="button" onClick={onToggleActive}>
            {customer.isActive ? "Inativar cliente" : "Reativar cliente"}
          </button>
        ) : null}
      </footer>
    </section>
  );
}
