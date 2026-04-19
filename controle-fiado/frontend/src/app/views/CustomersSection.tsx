import { useEffect, useMemo, useState } from "react";
import { CreateCustomerForm } from "../../features/customers/components/CreateCustomerForm";
import { CustomerDetailPanel } from "../../features/customers/components/CustomerDetailPanel";
import { CustomerList } from "../../features/customers/components/CustomerList";
import type { CustomerDetail } from "../../features/customers/types/customer-detail";
import type { Customer } from "../../features/customers/types/customer";

type CustomerFilter = "all" | "open" | "overdue" | "clear";

type CustomersSectionProps = {
  customers: Customer[];
  customerDetail: CustomerDetail | null;
  selectedCustomerId: string;
  isOwner: boolean;
  onSelectCustomer: (customerId: string) => void;
  onNavigate: (section: "operations" | "charges") => void;
  onCustomerCreated: (customer: Customer) => Promise<void>;
  onSuccess: (message: string) => void;
};

export function CustomersSection({
  customers,
  customerDetail,
  selectedCustomerId,
  isOwner,
  onSelectCustomer,
  onNavigate,
  onCustomerCreated,
  onSuccess
}: CustomersSectionProps) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<CustomerFilter>("all");
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    if (!showCreateForm) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setShowCreateForm(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [showCreateForm]);

  const filteredCustomers = useMemo(() => {
    return customers.filter((customer) => {
      const normalizedSearch = search.trim().toLowerCase();
      const matchesSearch =
        !normalizedSearch ||
        customer.name.toLowerCase().includes(normalizedSearch) ||
        customer.phone.toLowerCase().includes(normalizedSearch);

      if (!matchesSearch) {
        return false;
      }

      if (filter === "open") {
        return customer.openBalance > 0;
      }

      if (filter === "clear") {
        return customer.openBalance <= 0;
      }

      if (filter === "overdue") {
        return (customer.overdueSalesCount ?? 0) > 0;
      }

      return true;
    });
  }, [customers, filter, search]);

  return (
    <>
      <section className="section-block customers-command-panel">
        <div className="page-header page-header-section">
          <div>
            <div className="eyebrow">Clientes</div>
            <h2>Encontre o cliente</h2>
            <p className="page-description">Busque, filtre e abra a ficha para vender, receber ou cobrar.</p>
          </div>
          <button className="auth-button section-primary-action" type="button" onClick={() => setShowCreateForm(true)}>
            Novo cliente
          </button>
        </div>

        <div className="customer-toolbar">
          <label className="field-block customer-search">
            <span className="label">Buscar cliente</span>
            <input
              className="customer-selector"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Nome ou telefone"
            />
          </label>

          <div className="customer-filter-row" aria-label="Filtros de clientes">
            <button className={filter === "all" ? "active" : ""} type="button" onClick={() => setFilter("all")}>
              Todos
            </button>
            <button className={filter === "open" ? "active" : ""} type="button" onClick={() => setFilter("open")}>
              Com saldo
            </button>
            <button className={filter === "overdue" ? "active" : ""} type="button" onClick={() => setFilter("overdue")}>
              Em atraso
            </button>
          </div>
        </div>
      </section>

      <section className="section-block customers-workspace">
        <div className="customers-list-panel dashboard-chart-card" id="customers-list-panel">
          <div className="dashboard-card-head">
            <div>
              <div className="eyebrow">Carteira</div>
              <h3>Clientes encontrados</h3>
            </div>
          </div>
          <CustomerList customers={filteredCustomers} selectedCustomerId={selectedCustomerId} onSelectCustomer={onSelectCustomer} />
        </div>

        <div className="customer-detail-slot" id="customer-detail-panel">
          {customerDetail ? (
            <CustomerDetailPanel
              customer={customerDetail}
              canViewPayments={isOwner}
              onCreateSale={() => onNavigate("operations")}
              onRegisterPayment={isOwner ? () => onNavigate("operations") : undefined}
              onChargeCustomer={isOwner ? () => onNavigate("charges") : undefined}
            />
          ) : (
            <div className="empty-card">Selecione um cliente para abrir a ficha completa.</div>
          )}
        </div>
      </section>

      {showCreateForm ? (
        <div className="floating-form-overlay" role="presentation" onClick={() => setShowCreateForm(false)}>
          <div className="floating-form-shell" role="dialog" aria-modal="true" aria-labelledby="customer-create-title" onClick={(event) => event.stopPropagation()}>
            <CreateCustomerForm
              onCancel={() => setShowCreateForm(false)}
              onSuccess={onSuccess}
              onCreated={async (customer) => {
                await onCustomerCreated(customer);
                setShowCreateForm(false);
              }}
            />
          </div>
        </div>
      ) : null}
    </>
  );
}
