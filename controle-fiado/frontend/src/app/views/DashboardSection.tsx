import type { ChargeOverview } from "../../features/charges/types/charge-overview";
import type { DailyChargeJobMonitor } from "../../features/charges/types/daily-charge-job-monitor";
import { DashboardSummaryPanel } from "../../features/dashboard/components/DashboardSummaryPanel";
import type { DashboardSummary } from "../../features/dashboard/types/dashboard-summary";
import { RecentPaymentsList } from "../../features/payments/components/RecentPaymentsList";
import type { Payment } from "../../features/payments/types/payment";
import { RecentSalesList } from "../../features/sales/components/RecentSalesList";
import type { Sale } from "../../features/sales/types/sale";

type DashboardSectionProps = {
  isOwner: boolean;
  dashboardSummary: DashboardSummary | null;
  chargeOverview: ChargeOverview | null;
  dailyChargeJobMonitor: DailyChargeJobMonitor | null;
  sales: Sale[];
  payments: Payment[];
  onNavigate: (section: "customers" | "operations" | "charges") => void;
};

export function DashboardSection({
  isOwner,
  dashboardSummary,
  chargeOverview,
  dailyChargeJobMonitor,
  sales,
  payments,
  onNavigate
}: DashboardSectionProps) {
  return (
    <>
      <section className="quick-actions section-block">
        <button className="ghost-button" type="button" onClick={() => onNavigate("operations")}>
          Registrar movimentacao
        </button>
        <button className="ghost-button" type="button" onClick={() => onNavigate("customers")}>
          Consultar clientes
        </button>
        {isOwner ? (
          <button className="ghost-button" type="button" onClick={() => onNavigate("charges")}>
            Abrir cobrancas
          </button>
        ) : null}
      </section>

      {dashboardSummary ? (
        <DashboardSummaryPanel
          summary={dashboardSummary}
          chargeOverview={chargeOverview}
          monitor={isOwner ? dailyChargeJobMonitor : null}
          sales={sales}
          payments={payments}
        />
      ) : null}

      <section className="section-block dashboard-stream-grid">
        <article className="dashboard-chart-card">
          <div className="dashboard-card-head">
            <div>
              <div className="eyebrow">Vendas</div>
              <h3>Ultimas vendas registradas</h3>
            </div>
          </div>
          <RecentSalesList sales={sales} />
        </article>

        {isOwner ? (
          <article className="dashboard-chart-card">
            <div className="dashboard-card-head">
              <div>
                <div className="eyebrow">Pagamentos</div>
                <h3>Ultimos pagamentos recebidos</h3>
              </div>
            </div>
            <RecentPaymentsList payments={payments} />
          </article>
        ) : null}
      </section>
    </>
  );
}
