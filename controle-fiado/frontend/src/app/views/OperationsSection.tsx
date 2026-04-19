import { useEffect, useState } from "react";
import { CurrentCustomerBar } from "../../features/customers/components/CurrentCustomerBar";
import type { CustomerDetail } from "../../features/customers/types/customer-detail";
import type { Customer } from "../../features/customers/types/customer";
import { CreatePaymentForm } from "../../features/payments/components/CreatePaymentForm";
import { CreateSaleForm } from "../../features/sales/components/CreateSaleForm";
import type { AuthUser } from "../../features/auth/types/auth";

type OperationsSectionProps = {
  authUser: AuthUser;
  isOwner: boolean;
  customers: Customer[];
  customerDetail: CustomerDetail | null;
  selectedCustomerId: string;
  onSelectCustomer: (customerId: string) => void;
  onSuccess: (message: string) => void;
  onCreated: () => Promise<void>;
};

export function OperationsSection({
  authUser,
  isOwner,
  customers,
  customerDetail,
  selectedCustomerId,
  onSelectCustomer,
  onSuccess,
  onCreated
}: OperationsSectionProps) {
  const [activeMobileForm, setActiveMobileForm] = useState<"sale" | "payment" | null>(null);
  const [isMobile, setIsMobile] = useState(() => globalThis.matchMedia?.("(max-width: 860px)").matches ?? false);

  useEffect(() => {
    const mediaQuery = globalThis.matchMedia?.("(max-width: 860px)");

    if (!mediaQuery) {
      return;
    }

    const handleChange = (event: MediaQueryListEvent) => {
      setIsMobile(event.matches);
    };

    setIsMobile(mediaQuery.matches);
    mediaQuery.addEventListener("change", handleChange);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, []);

  useEffect(() => {
    if (!isMobile) {
      setActiveMobileForm(null);
      return;
    }

    if (!activeMobileForm) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setActiveMobileForm(null);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeMobileForm, isMobile]);

  const customerOptions = customers.map((customer) => ({ id: customer.id, name: customer.name }));

  return (
    <>
      <section className="section-block">
        <div className="page-header page-header-section">
          <div>
            <div className="eyebrow">Operacoes</div>
            <h2>Lancamento rapido</h2>
            <p className="page-description">Venda e pagamento lado a lado no desktop, com leitura direta e boa adaptacao no mobile.</p>
          </div>
        </div>
      </section>

      {customerDetail && !isMobile ? <CurrentCustomerBar customerName={customerDetail.name} openBalance={customerDetail.openBalance} /> : null}

      {isMobile ? (
        <section className="section-block operation-mobile-launcher">
          <div className="dashboard-card-head">
            <div>
              <div className="eyebrow">Acoes</div>
              <h3>Acoes rapidas</h3>
            </div>
          </div>

          <div className="operation-mobile-actions">
            <button className="auth-button" type="button" onClick={() => setActiveMobileForm("sale")}>
              Nova venda
            </button>
            {isOwner ? (
              <button className="ghost-button" type="button" onClick={() => setActiveMobileForm("payment")}>
                Novo pagamento
              </button>
            ) : null}
          </div>

          {!isOwner ? (
            <div className="operation-notice">
              Pagamentos continuam restritos ao perfil OWNER. No mobile, apenas o lancamento de venda fica disponivel para este usuario.
            </div>
          ) : null}
        </section>
      ) : (
        <section className="section-block operation-grid">
          <CreateSaleForm
            customerId={selectedCustomerId}
            customerName={customerDetail?.name}
            customerOptions={customerOptions}
            onCustomerChange={onSelectCustomer}
            createdById={authUser.id}
            onSuccess={onSuccess}
            onCreated={onCreated}
          />

          {isOwner ? (
            <CreatePaymentForm
              customerId={selectedCustomerId}
              customerName={customerDetail?.name}
              customerOptions={customerOptions}
              onCustomerChange={onSelectCustomer}
              createdById={authUser.id}
              openSales={customerDetail?.sales.filter((sale) => sale.remainingAmount > 0) ?? []}
              onSuccess={onSuccess}
              onCreated={onCreated}
            />
          ) : (
            <div className="operation-form operation-locked-card">
              <div className="eyebrow">Pagamentos</div>
              <h3>Acesso restrito</h3>
              <div className="customer-meta">Somente o perfil OWNER pode registrar pagamentos e acompanhar a distribuicao do valor.</div>
            </div>
          )}
        </section>
      )}

      {isMobile && activeMobileForm ? (
        <div className="floating-form-overlay" role="presentation" onClick={() => setActiveMobileForm(null)}>
          <div
            className="floating-form-shell"
            role="dialog"
            aria-modal="true"
            aria-labelledby={activeMobileForm === "sale" ? "sale-create-title" : "payment-create-title"}
            onClick={(event) => event.stopPropagation()}
          >
            {activeMobileForm === "sale" ? (
              <CreateSaleForm
                customerId={selectedCustomerId}
                customerName={customerDetail?.name}
                customerOptions={customerOptions}
                onCustomerChange={onSelectCustomer}
                createdById={authUser.id}
                onCancel={() => setActiveMobileForm(null)}
                onSuccess={onSuccess}
                onCreated={async () => {
                  await onCreated();
                  setActiveMobileForm(null);
                }}
              />
            ) : (
              <CreatePaymentForm
                customerId={selectedCustomerId}
                customerName={customerDetail?.name}
                customerOptions={customerOptions}
                onCustomerChange={onSelectCustomer}
                createdById={authUser.id}
                openSales={customerDetail?.sales.filter((sale) => sale.remainingAmount > 0) ?? []}
                onCancel={() => setActiveMobileForm(null)}
                onSuccess={onSuccess}
                onCreated={async () => {
                  await onCreated();
                  setActiveMobileForm(null);
                }}
              />
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}
