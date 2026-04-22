import { Suspense, lazy } from "react";
import { Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { AppShell } from "./app/AppShell";
import { useFiadoApp } from "./app/use-fiado-app";
import { AuthPanel } from "./features/auth/components/AuthPanel";
import { OperationNotice } from "./shared/components/OperationNotice";
import { getAuthMode } from "./shared/config/auth";
import { getDataMode } from "./shared/config/data";

const LoginView = lazy(async () => {
  const module = await import("./app/views/LoginView");
  return { default: module.LoginView };
});

const DashboardSection = lazy(async () => {
  const module = await import("./app/views/DashboardSection");
  return { default: module.DashboardSection };
});

const CustomersSection = lazy(async () => {
  const module = await import("./app/views/CustomersSection");
  return { default: module.CustomersSection };
});

const OperationsSection = lazy(async () => {
  const module = await import("./app/views/OperationsSection");
  return { default: module.OperationsSection };
});

const ChargesSection = lazy(async () => {
  const module = await import("./app/views/ChargesSection");
  return { default: module.ChargesSection };
});

const StatusSection = lazy(async () => {
  const module = await import("./app/views/StatusSection");
  return { default: module.StatusSection };
});

type AppSection = "dashboard" | "customers" | "operations" | "charges" | "status";

const SECTION_PATHS: Record<AppSection, string> = {
  dashboard: "/dashboard",
  customers: "/clientes",
  operations: "/operacoes",
  charges: "/cobrancas",
  status: "/sistema"
};

function getPageTitle(section: AppSection) {
  const titles = {
    dashboard: {
      kicker: "INICIO",
      title: "Painel operacional",
      description: "Veja o que precisa de atencao hoje sem perder tempo no caixa."
    },
    customers: {
      kicker: "CLIENTES",
      title: "Carteira de clientes",
      description: "Encontre o cliente, abra o detalhe quando precisar e mantenha a operacao mais limpa."
    },
    operations: {
      kicker: "OPERACOES",
      title: "Vendas e pagamentos",
      description: "Registre movimentacoes do dia com contexto suficiente para evitar erro no atendimento."
    },
    charges: {
      kicker: "COBRANCAS",
      title: "Fila de cobranca",
      description: "Acompanhe vencimentos, priorize contatos e monte mensagens em um fluxo simples."
    },
    status: {
      kicker: "SISTEMA",
      title: "Ambiente e integracoes",
      description: "Verifique banco, automacoes e saude da aplicacao quando precisar diagnosticar algo."
    }
  };

  return titles[section];
}

function getEnvironmentLabel(authMode: string, dataMode: string) {
  if (authMode === "supabase" || dataMode === "supabase") {
    return "Ambiente conectado";
  }

  return "Ambiente local";
}

function getSectionFromPath(pathname: string): AppSection | null {
  const entries = Object.entries(SECTION_PATHS) as Array<[AppSection, string]>;
  return entries.find(([, path]) => path === pathname)?.[0] ?? null;
}

function RouteFallback({ message = "Carregando tela..." }: { message?: string }) {
  return <div className="empty-card">{message}</div>;
}

export function App() {
  const { state, isOwner, actions } = useFiadoApp();
  const location = useLocation();
  const navigate = useNavigate();
  const authMode = getAuthMode();
  const dataMode = getDataMode();
  const environmentLabel = getEnvironmentLabel(authMode, dataMode);
  const activeSection = getSectionFromPath(location.pathname) ?? "dashboard";
  const pageTitle = getPageTitle(activeSection);

  function navigateToSection(section: AppSection) {
    navigate(SECTION_PATHS[section]);
  }

  if (!state.authUser && !state.loading) {
    return (
      <Suspense fallback={<RouteFallback message="Carregando acesso..." />}>
        <Routes>
          <Route path="/login" element={<LoginView environmentLabel={environmentLabel} notice={state.notice} onLogin={actions.login} />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Suspense>
    );
  }

  if (!state.authUser) {
    return <div className="empty-card">Carregando sessao...</div>;
  }

  if (location.pathname === "/login") {
    return <Navigate to={SECTION_PATHS.dashboard} replace />;
  }

  if (!isOwner && (activeSection === "charges" || activeSection === "status")) {
    return <Navigate to={SECTION_PATHS.dashboard} replace />;
  }

  return (
    <AppShell
      authUser={state.authUser}
      activeSection={activeSection}
      onNavigate={navigateToSection}
      onLogout={actions.logout}
      pageKey={location.pathname}
      sidebarFooter={<AuthPanel user={state.authUser} onLogin={actions.login} onLogout={actions.logout} />}
    >
      <header className="page-header">
        <div>
          <div className="eyebrow">{pageTitle.kicker}</div>
          <h2>{pageTitle.title}</h2>
          <p className="page-description">{pageTitle.description}</p>
        </div>
        <div className="status-card">
          <span className="status-dot" />
          {environmentLabel}
        </div>
      </header>

      {state.notice ? <OperationNotice tone={state.notice.tone} message={state.notice.message} /> : null}

      {!isOwner ? (
        <div className="empty-card">Voce esta no perfil STAFF. Clientes e vendas seguem liberados; pagamentos, cobrancas e controles administrativos continuam com OWNER.</div>
      ) : null}

      {state.loading ? <div className="empty-card">Carregando dados...</div> : null}
      {state.error ? <div className="empty-card error-card">{state.error}</div> : null}

      {!state.loading && !state.error ? (
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route
              path="/"
              element={<Navigate to={SECTION_PATHS.dashboard} replace />}
            />
            <Route
              path={SECTION_PATHS.dashboard}
              element={
                <DashboardSection
                  isOwner={isOwner}
                  dashboardSummary={state.dashboardSummary}
                  chargeOverview={state.chargeOverview}
                  dailyChargeJobMonitor={state.dailyChargeJobMonitor}
                  sales={state.sales}
                  payments={state.payments}
                  onNavigate={navigateToSection}
                />
              }
            />
            <Route
              path={SECTION_PATHS.customers}
              element={
                <CustomersSection
                  customers={state.customers}
                  customerDetail={state.customerDetail}
                  selectedCustomerId={state.selectedCustomerId}
                  isOwner={isOwner}
                  onSelectCustomer={actions.setSelectedCustomerId}
                  onNavigate={navigateToSection}
                  onCustomerCreated={async (customer) => {
                    await actions.refreshOperationalData(customer.id);
                  }}
                  onCustomerUpdated={async (customerId) => {
                    await actions.refreshOperationalData(customerId);
                  }}
                  onSuccess={(message) => actions.setNotice({ tone: "success", message })}
                />
              }
            />
            <Route
              path={SECTION_PATHS.operations}
              element={
                <OperationsSection
                  authUser={state.authUser}
                  isOwner={isOwner}
                  customers={state.customers}
                  customerDetail={state.customerDetail}
                  selectedCustomerId={state.selectedCustomerId}
                  onSelectCustomer={actions.setSelectedCustomerId}
                  onSuccess={(message) => actions.setNotice({ tone: "success", message })}
                  onCreated={async () => {
                    if (state.selectedCustomerId) {
                      await actions.refreshOperationalData(state.selectedCustomerId);
                    }
                  }}
                />
              }
            />
            {isOwner ? (
              <Route
                path={SECTION_PATHS.charges}
                element={
                  <ChargesSection
                    authUser={state.authUser}
                    customerDetail={state.customerDetail}
                    selectedCustomerId={state.selectedCustomerId}
                    chargeOverview={state.chargeOverview}
                    chargeMessages={state.chargeMessages}
                    dailyChargeJobMonitor={state.dailyChargeJobMonitor}
                    onSelectCustomer={actions.setSelectedCustomerId}
                    onSuccess={(message) => actions.setNotice({ tone: "success", message })}
                    onChargeDataRefresh={async () => {
                      if (state.selectedCustomerId) {
                        await actions.refreshChargeData(state.selectedCustomerId);
                      }
                    }}
                    onOperationalRefresh={actions.refreshOperationalData}
                  />
                }
              />
            ) : null}
            {isOwner ? <Route path={SECTION_PATHS.status} element={<StatusSection status={state.systemStatus} />} /> : null}
            <Route path="*" element={<Navigate to={SECTION_PATHS.dashboard} replace />} />
          </Routes>
        </Suspense>
      ) : null}
    </AppShell>
  );
}
