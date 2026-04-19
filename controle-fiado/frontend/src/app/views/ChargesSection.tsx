import { useEffect, useState } from "react";
import type { AuthUser } from "../../features/auth/types/auth";
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
  chargeOverview,
  onSelectCustomer,
  onSuccess,
  onOperationalRefresh
}: ChargesSectionProps) {
  const hasChargeableCustomer = Boolean(customerDetail && customerDetail.openBalance > 0);
  const [showManualChargeModal, setShowManualChargeModal] = useState(false);

  function handleQueueSelect(customerId: string) {
    onSelectCustomer(customerId);
    setShowManualChargeModal(true);
  }

  useEffect(() => {
    if (!showManualChargeModal) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setShowManualChargeModal(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [showManualChargeModal]);

  return (
    <>
      <section className="section-block charges-command-panel">
        <div className="page-header page-header-section charges-page-header">
          <div>
            <div className="eyebrow">Cobrancas</div>
            <h2>Clientes para cobrar</h2>
            <p className="page-description">Veja quem vence hoje ou ja esta em atraso e abra a mensagem direto da fila.</p>
          </div>
        </div>
      </section>

      {chargeOverview ? (
        <div id="charges-overview-panel">
          <ChargeOverviewPanel overview={chargeOverview} onSelectCustomer={handleQueueSelect} />
        </div>
      ) : (
        <section className="section-block" id="charges-overview-panel">
          <div className="empty-card">Nenhum cliente em vencimento ou atraso neste momento.</div>
        </section>
      )}

      {showManualChargeModal ? (
        <div className="floating-form-overlay" role="presentation" onClick={() => setShowManualChargeModal(false)}>
          <div className="floating-form-shell" role="dialog" aria-modal="true" aria-labelledby="manual-charge-title" onClick={(event) => event.stopPropagation()}>
            {hasChargeableCustomer && customerDetail ? (
              <ManualChargeForm
                customerId={customerDetail.id}
                customerName={customerDetail.name}
                customerPhone={customerDetail.phone}
                customerPhoneE164={customerDetail.phoneE164}
                saleId={customerDetail.sales.find((sale) => sale.remainingAmount > 0)?.id}
                openBalance={customerDetail.openBalance}
                createdById={authUser.id}
                onCancel={() => setShowManualChargeModal(false)}
                onSuccess={onSuccess}
                onSent={async () => {
                  await onOperationalRefresh(customerDetail.id);
                  setShowManualChargeModal(false);
                }}
              />
            ) : (
              <div className="dashboard-chart-card manual-charge-card">
                <div className="empty-card">Carregando o cliente selecionado para preparar a cobranca.</div>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}
