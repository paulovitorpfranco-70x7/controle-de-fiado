import type { AuthUser } from "../../features/auth/types/auth";
import { ChargeAutomationPanel } from "../../features/charges/components/ChargeAutomationPanel";
import { ChargeMessageList } from "../../features/charges/components/ChargeMessageList";
import { ChargeOverviewPanel } from "../../features/charges/components/ChargeOverviewPanel";
import { ManualChargeForm } from "../../features/charges/components/ManualChargeForm";
import type { ChargeMessage } from "../../features/charges/types/charge-message";
import type { ChargeOverview } from "../../features/charges/types/charge-overview";
import type { DailyChargeJobMonitor } from "../../features/charges/types/daily-charge-job-monitor";
import type { CustomerDetail } from "../../features/customers/types/customer-detail";

type ChargesSectionProps = {
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

export function ChargesSection({
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
}: ChargesSectionProps) {
  const hasChargeableCustomer = Boolean(customerDetail && customerDetail.openBalance > 0);

  function jumpToSection(sectionId: string) {
    const element = document.getElementById(sectionId);
    element?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <>
      <section className="section-block charges-command-panel">
        <div className="page-header page-header-section">
          <div>
            <div className="eyebrow">Cobrancas</div>
            <h2>Operacao de cobranca</h2>
            <p className="page-description">Fila, contato manual e historico recente sem excesso de informacao.</p>
          </div>
          <div className="status-card charges-status-card">
            <span className="status-dot" />
            {hasChargeableCustomer ? "Cliente pronto" : "Selecione na fila"}
          </div>
        </div>

        <div className="section-context-nav" aria-label="Atalhos da area de cobrancas">
          <button className="ghost-button" type="button" onClick={() => jumpToSection("charges-automation-panel")}>
            Automacao
          </button>
          <button className="ghost-button" type="button" onClick={() => jumpToSection("charges-manual-panel")}>
            Contato manual
          </button>
          <button className="ghost-button" type="button" onClick={() => jumpToSection("charges-overview-panel")}>
            Fila operacional
          </button>
          <button className="ghost-button" type="button" onClick={() => jumpToSection("charges-history-panel")}>
            Historico
          </button>
        </div>
      </section>

      <section className="section-block charges-workspace">
        <div id="charges-automation-panel">
          <ChargeAutomationPanel
            canRun={authUser.role === "OWNER"}
            monitor={dailyChargeJobMonitor}
            onSuccess={onSuccess}
            onCompleted={onChargeDataRefresh}
          />
        </div>

        {hasChargeableCustomer && customerDetail ? (
          <div id="charges-manual-panel">
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
          </div>
        ) : (
          <section className="section-block" id="charges-manual-panel">
            <div className="empty-card">Selecione na fila um cliente com saldo aberto para preparar a cobranca manual e abrir o WhatsApp.</div>
          </section>
        )}
      </section>

      {chargeOverview ? (
        <div id="charges-overview-panel">
          <ChargeOverviewPanel overview={chargeOverview} selectedCustomerId={selectedCustomerId} onSelectCustomer={onSelectCustomer} />
        </div>
      ) : null}

      {chargeMessages.length ? (
        <div id="charges-history-panel">
          <ChargeMessageList
            messages={chargeMessages}
            canRetry={authUser.role === "OWNER"}
            onRetried={onSuccess}
            onCompleted={async () => {
              await onOperationalRefresh(selectedCustomerId);
            }}
          />
        </div>
      ) : (
        <section className="section-block" id="charges-history-panel">
          <div className="empty-card">Nenhuma mensagem recente ainda. Quando a fila rodar ou uma cobranca manual for preparada, o historico aparece aqui.</div>
        </section>
      )}
    </>
  );
}
