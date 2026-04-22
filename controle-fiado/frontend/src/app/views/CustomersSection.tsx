import { useEffect, useMemo, useState } from "react";
import { CreateCustomerForm } from "../../features/customers/components/CreateCustomerForm";
import { CustomerDetailPanel } from "../../features/customers/components/CustomerDetailPanel";
import { CustomerList } from "../../features/customers/components/CustomerList";
import { EditCustomerForm } from "../../features/customers/components/EditCustomerForm";
import { updateCustomer } from "../../features/customers/api/update-customer";
import type { CustomerDetail } from "../../features/customers/types/customer-detail";
import type { Customer } from "../../features/customers/types/customer";
import type { Sale } from "../../features/sales/types/sale";

type CustomerFilter = "all" | "open" | "overdue" | "clear";

type CustomersSectionProps = {
  customers: Customer[];
  customerDetail: CustomerDetail | null;
  selectedCustomerId: string;
  isOwner: boolean;
  onSelectCustomer: (customerId: string) => void;
  onNavigate: (section: "operations" | "charges") => void;
  onCustomerCreated: (customer: Customer) => Promise<void>;
  onCustomerUpdated: (customerId: string) => Promise<void>;
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
  onCustomerUpdated,
  onSuccess
}: CustomersSectionProps) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<CustomerFilter>("all");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [saleItemsTarget, setSaleItemsTarget] = useState<Sale | null>(null);
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
    if (!showCreateForm && !showDetail && !showEditForm && !saleItemsTarget) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setShowCreateForm(false);
        setShowEditForm(false);
        setSaleItemsTarget(null);
        setShowDetail(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [saleItemsTarget, showCreateForm, showDetail, showEditForm]);

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

  const selectedCustomerSummary = customers.find((customer) => customer.id === selectedCustomerId) ?? null;

  function handleSelectCustomer(customerId: string) {
    onSelectCustomer(customerId);
    setShowDetail(true);
  }

  async function handleToggleCustomerActive() {
    if (!customerDetail) {
      return;
    }

    try {
      await updateCustomer(customerDetail.id, {
        isActive: !customerDetail.isActive
      });
      onSuccess(customerDetail.isActive ? "Cliente inativado com sucesso." : "Cliente reativado com sucesso.");
      await onCustomerUpdated(customerDetail.id);
    } catch (error) {
      onSuccess(error instanceof Error ? error.message : "Falha ao atualizar status do cliente.");
    }
  }

  return (
    <>
      <section className="section-block customers-command-panel">
        <div className="section-inline-header">
          <div>
            <div className="eyebrow">Operacao da carteira</div>
            <p className="page-description">Busque o cliente e abra os detalhes somente quando precisar operar ou consultar historico.</p>
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
            <button className={filter === "clear" ? "active" : ""} type="button" onClick={() => setFilter("clear")}>
              Sem saldo
            </button>
          </div>
        </div>
      </section>

      <section className="section-block customers-workspace customers-workspace-lean">
        <div className="customers-list-panel dashboard-chart-card" id="customers-list-panel">
          <div className="dashboard-card-head">
            <div>
              <div className="eyebrow">Carteira</div>
              <h3>{`${filteredCustomers.length} cliente(s) encontrados`}</h3>
            </div>
          </div>
          <CustomerList customers={filteredCustomers} selectedCustomerId={selectedCustomerId} onSelectCustomer={handleSelectCustomer} />
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
                setShowDetail(true);
              }}
            />
          </div>
        </div>
      ) : null}

      {showDetail ? (
        <div className="floating-form-overlay customer-detail-drawer-overlay" role="presentation" onClick={() => setShowDetail(false)}>
          <div
            className={`floating-form-shell customer-detail-drawer-shell ${isMobile ? "customer-detail-drawer-shell-mobile" : ""}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby={isMobile ? "customer-mobile-title" : "customer-drawer-title"}
            onClick={(event) => event.stopPropagation()}
          >
            {customerDetail && customerDetail.id === selectedCustomerId ? (
              <CustomerDetailPanel
                customer={customerDetail}
                canViewPayments={isOwner}
                isCompactMobile={isMobile}
                onClose={() => setShowDetail(false)}
                onCreateSale={() => {
                  setShowDetail(false);
                  onNavigate("operations");
                }}
                onRegisterPayment={
                  isOwner
                    ? () => {
                        setShowDetail(false);
                        onNavigate("operations");
                      }
                    : undefined
                }
                onChargeCustomer={
                  isOwner
                    ? () => {
                        setShowDetail(false);
                        onNavigate("charges");
                      }
                    : undefined
                }
                onEditCustomer={() => setShowEditForm(true)}
                onToggleActive={handleToggleCustomerActive}
                onViewSaleItems={(sale) => setSaleItemsTarget(sale)}
              />
            ) : (
              <div className="customer-detail-loading">
                <div className="eyebrow">Detalhes</div>
                <h3>{selectedCustomerSummary?.name ?? "Carregando cliente"}</h3>
                <p className="page-description">Buscando ficha completa do cliente selecionado.</p>
              </div>
            )}
          </div>
        </div>
      ) : null}

      {showEditForm && customerDetail ? (
        <div className="floating-form-overlay" role="presentation" onClick={() => setShowEditForm(false)}>
          <div className="floating-form-shell" role="dialog" aria-modal="true" aria-labelledby="customer-edit-title" onClick={(event) => event.stopPropagation()}>
            <EditCustomerForm
              customer={customerDetail}
              onCancel={() => setShowEditForm(false)}
              onSuccess={onSuccess}
              onUpdated={async () => {
                await onCustomerUpdated(customerDetail.id);
                setShowEditForm(false);
              }}
            />
          </div>
        </div>
      ) : null}

      {saleItemsTarget ? (
        <div className="floating-form-overlay" role="presentation" onClick={() => setSaleItemsTarget(null)}>
          <div className="floating-form-shell sale-items-dialog-shell" role="dialog" aria-modal="true" aria-labelledby="sale-items-dialog-title" onClick={(event) => event.stopPropagation()}>
            <section className="operation-form sale-items-dialog">
              <div className="operation-header">
                <div>
                  <div className="eyebrow">Itens da venda</div>
                  <h3 id="sale-items-dialog-title">{saleItemsTarget.description}</h3>
                </div>
                <button className="floating-form-close" type="button" aria-label="Fechar itens da venda" onClick={() => setSaleItemsTarget(null)}>
                  <span aria-hidden="true">×</span>
                </button>
              </div>

              <div className="sale-items-dialog-list">
                {saleItemsTarget.saleItems.map((item, index) => (
                  <div key={`${saleItemsTarget.id}-${index}`} className="sale-items-dialog-row">
                    <div>
                      <strong>{item.name}</strong>
                      <div className="customer-meta">{`${formatSaleItemQuantity(item.quantity)} x ${formatMoney(item.unitPrice)}`}</div>
                    </div>
                    <strong>{formatMoney(item.quantity * item.unitPrice)}</strong>
                  </div>
                ))}
              </div>

              <div className="sale-items-dialog-total">
                <span>Total dos itens</span>
                <strong>
                  {formatMoney(
                    saleItemsTarget.saleItems.reduce((total, item) => total + item.quantity * item.unitPrice, 0)
                  )}
                </strong>
              </div>
            </section>
          </div>
        </div>
      ) : null}
    </>
  );
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  }).format(value);
}

function formatSaleItemQuantity(value: number) {
  return Number.isInteger(value) ? String(value) : value.toLocaleString("pt-BR");
}
