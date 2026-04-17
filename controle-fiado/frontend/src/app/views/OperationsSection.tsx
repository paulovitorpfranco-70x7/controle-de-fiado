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

      {customerDetail ? <CurrentCustomerBar customerName={customerDetail.name} openBalance={customerDetail.openBalance} /> : null}

      <section className="section-block operation-grid">
        <CreateSaleForm
          customerId={selectedCustomerId}
          customerName={customerDetail?.name}
          customerOptions={customers.map((customer) => ({ id: customer.id, name: customer.name }))}
          onCustomerChange={onSelectCustomer}
          createdById={authUser.id}
          onSuccess={onSuccess}
          onCreated={onCreated}
        />

        {isOwner ? (
          <CreatePaymentForm
            customerId={selectedCustomerId}
            customerName={customerDetail?.name}
            customerOptions={customers.map((customer) => ({ id: customer.id, name: customer.name }))}
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
    </>
  );
}
