import { useEffect, useState } from "react";
import { restoreSession, signIn, signOut, subscribeToAuthChanges } from "../features/auth/api/session";
import { AuthPanel } from "../features/auth/components/AuthPanel";
import type { AuthUser } from "../features/auth/types/auth";
import { fetchChargeMessages } from "../features/charges/api/fetch-charge-messages";
import { fetchDailyChargeJobMonitor } from "../features/charges/api/fetch-daily-charge-job-monitor";
import { fetchChargeOverview } from "../features/charges/api/fetch-charge-overview";
import { ChargeAutomationPanel } from "../features/charges/components/ChargeAutomationPanel";
import { ChargeAlertsPanel } from "../features/charges/components/ChargeAlertsPanel";
import { ChargeMessageList } from "../features/charges/components/ChargeMessageList";
import { ChargeOverviewPanel } from "../features/charges/components/ChargeOverviewPanel";
import { ManualChargeForm } from "../features/charges/components/ManualChargeForm";
import type { ChargeMessage } from "../features/charges/types/charge-message";
import type { DailyChargeJobMonitor } from "../features/charges/types/daily-charge-job-monitor";
import type { ChargeOverview } from "../features/charges/types/charge-overview";
import { fetchDashboardSummary } from "../features/dashboard/api/fetch-dashboard-summary";
import { DashboardSummaryPanel } from "../features/dashboard/components/DashboardSummaryPanel";
import type { DashboardSummary } from "../features/dashboard/types/dashboard-summary";
import { fetchCustomerDetail } from "../features/customers/api/fetch-customer-detail";
import { CurrentCustomerBar } from "../features/customers/components/CurrentCustomerBar";
import { CreateCustomerForm } from "../features/customers/components/CreateCustomerForm";
import { CustomerDetailPanel } from "../features/customers/components/CustomerDetailPanel";
import { fetchCustomers } from "../features/customers/api/fetch-customers";
import { CustomerList } from "../features/customers/components/CustomerList";
import type { CustomerDetail } from "../features/customers/types/customer-detail";
import type { Customer } from "../features/customers/types/customer";
import { fetchPayments } from "../features/payments/api/fetch-payments";
import { CreatePaymentForm } from "../features/payments/components/CreatePaymentForm";
import { RecentPaymentsList } from "../features/payments/components/RecentPaymentsList";
import type { Payment } from "../features/payments/types/payment";
import { fetchSales } from "../features/sales/api/fetch-sales";
import { CreateSaleForm } from "../features/sales/components/CreateSaleForm";
import { RecentSalesList } from "../features/sales/components/RecentSalesList";
import type { Sale } from "../features/sales/types/sale";
import { fetchSystemStatus } from "../features/system/api/fetch-system-status";
import { SystemStatusPanel } from "../features/system/components/SystemStatusPanel";
import type { SystemStatus } from "../features/system/types/system-status";
import { getAuthMode } from "../shared/config/auth";
import { getDataMode } from "../shared/config/data";
import { OperationNotice } from "../shared/components/OperationNotice";

type AppView = "dashboard" | "customers" | "operations" | "charges" | "status";

export function CustomersPage() {
  const authMode = getAuthMode();
  const dataMode = getDataMode();
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [dashboardSummary, setDashboardSummary] = useState<DashboardSummary | null>(null);
  const [chargeMessages, setChargeMessages] = useState<ChargeMessage[]>([]);
  const [chargeOverview, setChargeOverview] = useState<ChargeOverview | null>(null);
  const [dailyChargeJobMonitor, setDailyChargeJobMonitor] = useState<DailyChargeJobMonitor | null>(null);
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [customerDetail, setCustomerDetail] = useState<CustomerDetail | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ tone: "success" | "error"; message: string } | null>(null);
  const [activeView, setActiveView] = useState<AppView>("dashboard");
  const isOwner = authUser?.role === "OWNER";
  const pageTitle = getPageTitle(activeView, dataMode);

  async function refreshOperationalData(customerId: string) {
    const customerDataPromise = fetchCustomers();
    const detailDataPromise = fetchCustomerDetail(customerId);
    const salesDataPromise = fetchSales();
    const dashboardDataPromise = isOwner ? fetchDashboardSummary() : Promise.resolve(null);
    const paymentDataPromise = isOwner ? fetchPayments() : Promise.resolve([]);
    const overviewDataPromise = isOwner ? fetchChargeOverview() : Promise.resolve(null);
    const messageDataPromise = isOwner ? fetchChargeMessages(customerId) : Promise.resolve([]);
    const jobMonitorDataPromise = isOwner ? fetchDailyChargeJobMonitor() : Promise.resolve(null);
    const systemStatusDataPromise = isOwner ? fetchSystemStatus() : Promise.resolve(null);

    const [customerData, dashboardData, salesData, paymentData, overviewData, detailData, messageData, jobMonitorData, systemStatusData] =
      await Promise.all([
        customerDataPromise,
        dashboardDataPromise,
        salesDataPromise,
        paymentDataPromise,
        overviewDataPromise,
        detailDataPromise,
        messageDataPromise,
        jobMonitorDataPromise,
        systemStatusDataPromise
      ]);

    setCustomers(customerData);
    setDashboardSummary(dashboardData);
    setSales(salesData.slice(0, 3));
    setPayments(paymentData.slice(0, 3));
    setChargeOverview(overviewData);
    setCustomerDetail(detailData);
    setChargeMessages(messageData.slice(0, 5));
    setDailyChargeJobMonitor(jobMonitorData);
    setSystemStatus(systemStatusData);
  }

  async function refreshChargeData(customerId: string) {
    if (!isOwner) {
      return;
    }

    const [overviewData, messageData, jobMonitorData] = await Promise.all([
      fetchChargeOverview(),
      fetchChargeMessages(customerId),
      fetchDailyChargeJobMonitor()
    ]);

    setChargeOverview(overviewData);
    setChargeMessages(messageData.slice(0, 5));
    setDailyChargeJobMonitor(jobMonitorData);
  }

  function clearSession() {
    setAuthUser(null);
    setCustomers([]);
    setDashboardSummary(null);
    setChargeMessages([]);
    setChargeOverview(null);
    setDailyChargeJobMonitor(null);
    setSelectedCustomerId("");
    setCustomerDetail(null);
    setPayments([]);
    setSales([]);
    setSystemStatus(null);
  }

  useEffect(() => {
    restoreSession()
      .then((user) => {
        setAuthUser(user ?? null);
      })
      .catch(() => {
        clearSession();
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges(() => {
      restoreSession()
        .then((user) => {
          setAuthUser(user ?? null);
        })
        .catch(() => {
          clearSession();
        });
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!authUser) {
      return;
    }

    setLoading(true);
    Promise.all([
      fetchCustomers(),
      isOwner ? fetchDashboardSummary() : Promise.resolve(null),
      fetchSales(),
      isOwner ? fetchPayments() : Promise.resolve([]),
      isOwner ? fetchChargeOverview() : Promise.resolve(null),
      isOwner ? fetchDailyChargeJobMonitor() : Promise.resolve(null),
      isOwner ? fetchSystemStatus() : Promise.resolve(null)
    ])
      .then(([customerData, dashboardData, salesData, paymentData, overviewData, jobMonitorData, systemStatusData]) => {
        setCustomers(customerData);
        if (customerData.length > 0) {
          setSelectedCustomerId(customerData[0].id);
        }
        setDashboardSummary(dashboardData);
        setSales(salesData.slice(0, 3));
        setPayments(paymentData.slice(0, 3));
        setChargeOverview(overviewData);
        setDailyChargeJobMonitor(jobMonitorData);
        setSystemStatus(systemStatusData);
        setError(null);
      })
      .catch((err: Error) => {
        if (err.message.includes("Token")) {
          clearSession();
        }
        setError(err.message);
        setNotice({ tone: "error", message: err.message });
      })
      .finally(() => {
        setLoading(false);
      });
  }, [authUser, isOwner]);

  useEffect(() => {
    if (!selectedCustomerId) {
      return;
    }

    fetchCustomerDetail(selectedCustomerId)
      .then((data) => {
        setCustomerDetail(data);
      })
      .catch((err: Error) => {
        if (err.message.includes("Token")) {
          clearSession();
        }
        setError(err.message);
        setNotice({ tone: "error", message: err.message });
      });

    if (!isOwner) {
      setChargeMessages([]);
      return;
    }

    fetchChargeMessages(selectedCustomerId)
      .then((data) => {
        setChargeMessages(data.slice(0, 5));
      })
      .catch((err: Error) => {
        if (err.message.includes("Token")) {
          clearSession();
        }
        setError(err.message);
        setNotice({ tone: "error", message: err.message });
      });
  }, [selectedCustomerId, isOwner]);

  useEffect(() => {
    if (!isOwner && (activeView === "charges" || activeView === "status")) {
      setActiveView("dashboard");
    }
  }, [activeView, isOwner]);

  return (
    <div className="page-shell">
      <aside className="side-panel">
        <div className="eyebrow">Controle de Fiado</div>
        <h1>Mercadinho do Tonhao</h1>
        <p>Base real do sistema com API, banco e integracao futura com WhatsApp.</p>
        {authUser ? (
          <nav className="app-nav" aria-label="Navegacao principal">
            <button className={activeView === "dashboard" ? "active" : ""} type="button" onClick={() => setActiveView("dashboard")}>
              Dashboard
            </button>
            <button className={activeView === "customers" ? "active" : ""} type="button" onClick={() => setActiveView("customers")}>
              Clientes
            </button>
            <button className={activeView === "operations" ? "active" : ""} type="button" onClick={() => setActiveView("operations")}>
              Venda e pagamento
            </button>
            {isOwner ? (
              <>
                <button className={activeView === "charges" ? "active" : ""} type="button" onClick={() => setActiveView("charges")}>
                  Cobrancas
                </button>
                <button className={activeView === "status" ? "active" : ""} type="button" onClick={() => setActiveView("status")}>
                  Status
                </button>
              </>
            ) : null}
          </nav>
        ) : null}
        <AuthPanel
          user={authUser}
          onLogout={async () => {
            await signOut();
            clearSession();
            setNotice({ tone: "success", message: "Sessao encerrada com sucesso." });
          }}
          onLogin={async (input) => {
            const user = await signIn(input);
            setAuthUser(user);
            setNotice({ tone: "success", message: "Sessao iniciada com sucesso." });
          }}
        />
      </aside>

      <main className="content-panel">
        <header className="page-header">
          <div>
            <div className="eyebrow">{pageTitle.kicker}</div>
            <h2>{pageTitle.title}</h2>
            <p className="page-description">{pageTitle.description}</p>
          </div>
          <div className="status-card">
            <span className="status-dot" />
            {dataMode === "supabase"
              ? `Auth ${authMode} | Dados ${dataMode}`
              : "Backend esperado em `http://127.0.0.1:3333`"}
          </div>
        </header>

        {!authUser && !loading ? <div className="empty-card">Faca login para acessar o sistema.</div> : null}
        {loading ? <div className="empty-card">Carregando clientes...</div> : null}
        {error ? <div className="empty-card error-card">{error}</div> : null}

        {!loading && !error && authUser ? (
          <>
            {notice ? <OperationNotice tone={notice.tone} message={notice.message} /> : null}
            {!isOwner ? (
              <div className="empty-card">
                Voce esta no perfil STAFF. Clientes e vendas estao liberados; pagamentos, cobrancas e controles administrativos ficam com o OWNER.
              </div>
            ) : null}

            {activeView === "dashboard" ? (
              <DashboardView
                isOwner={isOwner}
                dashboardSummary={dashboardSummary}
                chargeOverview={chargeOverview}
                dailyChargeJobMonitor={dailyChargeJobMonitor}
                sales={sales}
                payments={payments}
                onGoToOperations={() => setActiveView("operations")}
                onGoToCustomers={() => setActiveView("customers")}
                onGoToCharges={() => setActiveView("charges")}
              />
            ) : null}

            {activeView === "customers" ? (
              <CustomersView
                customers={customers}
                customerDetail={customerDetail}
                selectedCustomerId={selectedCustomerId}
                isOwner={isOwner}
                onSelectCustomer={setSelectedCustomerId}
                onCustomerCreated={async (customer) => {
                  await refreshOperationalData(customer.id);
                  setSelectedCustomerId(customer.id);
                }}
                onSuccess={(message) => setNotice({ tone: "success", message })}
              />
            ) : null}

            {activeView === "operations" && selectedCustomerId ? (
              <OperationsView
                authUser={authUser}
                isOwner={isOwner}
                customers={customers}
                customerDetail={customerDetail}
                selectedCustomerId={selectedCustomerId}
                onSelectCustomer={setSelectedCustomerId}
                onSuccess={(message) => setNotice({ tone: "success", message })}
                onCreated={async () => {
                  await refreshOperationalData(selectedCustomerId);
                }}
              />
            ) : null}

            {activeView === "charges" && isOwner ? (
              <ChargesView
                authUser={authUser}
                customerDetail={customerDetail}
                selectedCustomerId={selectedCustomerId}
                chargeOverview={chargeOverview}
                chargeMessages={chargeMessages}
                dailyChargeJobMonitor={dailyChargeJobMonitor}
                onSelectCustomer={setSelectedCustomerId}
                onSuccess={(message) => setNotice({ tone: "success", message })}
                onChargeDataRefresh={async () => {
                  await refreshChargeData(selectedCustomerId);
                }}
                onOperationalRefresh={async (customerId) => {
                  await refreshOperationalData(customerId);
                }}
              />
            ) : null}

            {activeView === "status" && isOwner ? <StatusView status={systemStatus} /> : null}
          </>
        ) : null}
      </main>
    </div>
  );
}

function getPageTitle(activeView: AppView, dataMode: string) {
  const titles: Record<AppView, { kicker: string; title: string; description: string }> = {
    dashboard: {
      kicker: "Inicio",
      title: dataMode === "supabase" ? "Base web conectada ao Supabase" : "Base inicial conectada com API",
      description: "Resumo da operacao e atalhos principais para o dia a dia."
    },
    customers: {
      kicker: "Clientes",
      title: "Cadastro e ficha do cliente",
      description: "Consulte, selecione e cadastre clientes sem misturar com pagamentos ou cobrancas."
    },
    operations: {
      kicker: "Operacao",
      title: "Venda e pagamento",
      description: "Registre vendas fiado e pagamentos no cliente selecionado."
    },
    charges: {
      kicker: "Cobrancas",
      title: "Lembretes por WhatsApp",
      description: "Prepare mensagens manuais e acompanhe vencimentos."
    },
    status: {
      kicker: "Sistema",
      title: "Status do ambiente",
      description: "Informacoes tecnicas do ambiente web."
    }
  };

  return titles[activeView];
}

type DashboardViewProps = {
  isOwner: boolean;
  dashboardSummary: DashboardSummary | null;
  chargeOverview: ChargeOverview | null;
  dailyChargeJobMonitor: DailyChargeJobMonitor | null;
  sales: Sale[];
  payments: Payment[];
  onGoToOperations: () => void;
  onGoToCustomers: () => void;
  onGoToCharges: () => void;
};

function DashboardView({
  isOwner,
  dashboardSummary,
  chargeOverview,
  dailyChargeJobMonitor,
  sales,
  payments,
  onGoToOperations,
  onGoToCustomers,
  onGoToCharges
}: DashboardViewProps) {
  return (
    <>
      <section className="quick-actions section-block">
        <button className="ghost-button" type="button" onClick={onGoToOperations}>
          Nova venda / pagamento
        </button>
        <button className="ghost-button" type="button" onClick={onGoToCustomers}>
          Abrir clientes
        </button>
        {isOwner ? (
          <button className="ghost-button" type="button" onClick={onGoToCharges}>
            Ver cobrancas
          </button>
        ) : null}
      </section>

      {dashboardSummary ? <DashboardSummaryPanel summary={dashboardSummary} /> : null}
      {chargeOverview && isOwner ? <ChargeAlertsPanel overview={chargeOverview} monitor={dailyChargeJobMonitor} /> : null}

      <section className="section-block">
        <div className="page-header page-header-section">
          <div>
            <div className="eyebrow">Vendas</div>
            <h2>Ultimas vendas fiado</h2>
          </div>
        </div>
        <RecentSalesList sales={sales} />
      </section>

      {isOwner ? (
        <section className="section-block">
          <div className="page-header page-header-section">
            <div>
              <div className="eyebrow">Pagamentos</div>
              <h2>Ultimos pagamentos</h2>
            </div>
          </div>
          <RecentPaymentsList payments={payments} />
        </section>
      ) : null}
    </>
  );
}

type CustomersViewProps = {
  customers: Customer[];
  customerDetail: CustomerDetail | null;
  selectedCustomerId: string;
  isOwner: boolean;
  onSelectCustomer: (customerId: string) => void;
  onCustomerCreated: (customer: Customer) => Promise<void>;
  onSuccess: (message: string) => void;
};

function CustomersView({
  customers,
  customerDetail,
  selectedCustomerId,
  isOwner,
  onSelectCustomer,
  onCustomerCreated,
  onSuccess
}: CustomersViewProps) {
  return (
    <>
      <section className="section-block">
        <div className="page-header page-header-section">
          <div>
            <div className="eyebrow">Clientes</div>
            <h2>Base operacional inicial</h2>
          </div>
        </div>
        <CreateCustomerForm onSuccess={onSuccess} onCreated={onCustomerCreated} />
        <div style={{ height: 16 }} />
        <CustomerList customers={customers} selectedCustomerId={selectedCustomerId} onSelectCustomer={onSelectCustomer} />
      </section>

      {customerDetail ? (
        <CustomerDetailPanel
          customer={customerDetail}
          selectedCustomerId={selectedCustomerId}
          onCustomerChange={onSelectCustomer}
          canViewPayments={isOwner}
          options={customers.map((customer) => ({
            id: customer.id,
            name: customer.name
          }))}
        />
      ) : null}
    </>
  );
}

type OperationsViewProps = {
  authUser: AuthUser;
  isOwner: boolean;
  customers: Customer[];
  customerDetail: CustomerDetail | null;
  selectedCustomerId: string;
  onSelectCustomer: (customerId: string) => void;
  onSuccess: (message: string) => void;
  onCreated: () => Promise<void>;
};

function OperationsView({
  authUser,
  isOwner,
  customers,
  customerDetail,
  selectedCustomerId,
  onSelectCustomer,
  onSuccess,
  onCreated
}: OperationsViewProps) {
  return (
    <>
      {customerDetail ? <CurrentCustomerBar customerName={customerDetail.name} openBalance={customerDetail.openBalance} /> : null}
      <section className="section-block operation-grid">
        <CreateSaleForm
          customerId={selectedCustomerId}
          customerName={customerDetail?.name}
          customerOptions={customers.map((customer) => ({
            id: customer.id,
            name: customer.name
          }))}
          onCustomerChange={onSelectCustomer}
          createdById={authUser.id}
          onSuccess={onSuccess}
          onCreated={onCreated}
        />
        {isOwner ? (
          <CreatePaymentForm
            customerId={selectedCustomerId}
            customerName={customerDetail?.name}
            customerOptions={customers.map((customer) => ({
              id: customer.id,
              name: customer.name
            }))}
            onCustomerChange={onSelectCustomer}
            createdById={authUser.id}
            openSales={customerDetail?.sales.filter((sale) => sale.remainingAmount > 0) ?? []}
            onSuccess={onSuccess}
            onCreated={onCreated}
          />
        ) : (
          <div className="operation-form">
            <div className="eyebrow">Pagamentos</div>
            <div className="customer-meta">Somente o perfil OWNER pode registrar pagamentos.</div>
          </div>
        )}
      </section>
    </>
  );
}

type ChargesViewProps = {
  authUser: AuthUser;
  customerDetail: CustomerDetail | null;
  selectedCustomerId: string;
  chargeOverview: ChargeOverview | null;
  chargeMessages: ChargeMessage[];
  dailyChargeJobMonitor: DailyChargeJobMonitor | null;
  onSelectCustomer: (customerId: string) => void;
  onSuccess: (message: string) => void;
  onChargeDataRefresh: () => Promise<void>;
  onOperationalRefresh: (customerId: string) => Promise<void>;
};

function ChargesView({
  authUser,
  customerDetail,
  selectedCustomerId,
  chargeOverview,
  chargeMessages,
  dailyChargeJobMonitor,
  onSelectCustomer,
  onSuccess,
  onChargeDataRefresh,
  onOperationalRefresh
}: ChargesViewProps) {
  return (
    <>
      <ChargeAutomationPanel
        canRun={authUser.role === "OWNER"}
        monitor={dailyChargeJobMonitor}
        onSuccess={onSuccess}
        onCompleted={onChargeDataRefresh}
      />

      {customerDetail ? (
        <ManualChargeForm
          customerId={customerDetail.id}
          customerName={customerDetail.name}
          customerPhone={customerDetail.phone}
          customerPhoneE164={customerDetail.phoneE164}
          saleId={customerDetail.sales.find((sale) => sale.remainingAmount > 0)?.id}
          openBalance={customerDetail.openBalance}
          createdById={authUser.id}
          onSuccess={onSuccess}
          onSent={async () => {
            await onOperationalRefresh(customerDetail.id);
          }}
        />
      ) : null}

      {chargeOverview ? (
        <ChargeOverviewPanel overview={chargeOverview} selectedCustomerId={selectedCustomerId} onSelectCustomer={onSelectCustomer} />
      ) : null}

      {chargeMessages.length ? (
        <ChargeMessageList
          messages={chargeMessages}
          canRetry={authUser.role === "OWNER"}
          onRetried={onSuccess}
          onCompleted={async () => {
            await onOperationalRefresh(selectedCustomerId);
          }}
        />
      ) : null}
    </>
  );
}

function StatusView({ status }: { status: SystemStatus | null }) {
  return status ? <SystemStatusPanel status={status} /> : <div className="empty-card">Status do ambiente indisponivel.</div>;
}
