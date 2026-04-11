import { useEffect, useState } from "react";
import { fetchMe } from "../features/auth/api/fetch-me";
import { login } from "../features/auth/api/login";
import { AuthPanel } from "../features/auth/components/AuthPanel";
import type { AuthUser } from "../features/auth/types/auth";
import { fetchCustomerDetail } from "../features/customers/api/fetch-customer-detail";
import { CustomerDetailPanel } from "../features/customers/components/CustomerDetailPanel";
import { fetchCustomers } from "../features/customers/api/fetch-customers";
import { CustomerList } from "../features/customers/components/CustomerList";
import type { CustomerDetail } from "../features/customers/types/customer-detail";
import type { Customer } from "../features/customers/types/customer";
import { fetchChargeMessages } from "../features/charges/api/fetch-charge-messages";
import { fetchChargeOverview } from "../features/charges/api/fetch-charge-overview";
import { ChargeAutomationPanel } from "../features/charges/components/ChargeAutomationPanel";
import { ChargeMessageList } from "../features/charges/components/ChargeMessageList";
import { ChargeOverviewPanel } from "../features/charges/components/ChargeOverviewPanel";
import type { ChargeMessage } from "../features/charges/types/charge-message";
import type { ChargeOverview } from "../features/charges/types/charge-overview";
import { fetchPayments } from "../features/payments/api/fetch-payments";
import { CreatePaymentForm } from "../features/payments/components/CreatePaymentForm";
import { RecentPaymentsList } from "../features/payments/components/RecentPaymentsList";
import type { Payment } from "../features/payments/types/payment";
import { fetchSales } from "../features/sales/api/fetch-sales";
import { CreateSaleForm } from "../features/sales/components/CreateSaleForm";
import { RecentSalesList } from "../features/sales/components/RecentSalesList";
import type { Sale } from "../features/sales/types/sale";
import { setAuthToken } from "../shared/api/http";

export function CustomersPage() {
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [chargeMessages, setChargeMessages] = useState<ChargeMessage[]>([]);
  const [chargeOverview, setChargeOverview] = useState<ChargeOverview | null>(null);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");
  const [customerDetail, setCustomerDetail] = useState<CustomerDetail | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function refreshOperationalData(customerId: string) {
    const [customerData, salesData, paymentData, overviewData, detailData, messageData] = await Promise.all([
      fetchCustomers(),
      fetchSales(),
      fetchPayments(),
      fetchChargeOverview(),
      fetchCustomerDetail(customerId),
      fetchChargeMessages(customerId)
    ]);

    setCustomers(customerData);
    setSales(salesData.slice(0, 3));
    setPayments(paymentData.slice(0, 3));
    setChargeOverview(overviewData);
    setCustomerDetail(detailData);
    setChargeMessages(messageData.slice(0, 5));
  }

  async function refreshChargeData(customerId: string) {
    const [overviewData, messageData] = await Promise.all([
      fetchChargeOverview(),
      fetchChargeMessages(customerId)
    ]);

    setChargeOverview(overviewData);
    setChargeMessages(messageData.slice(0, 5));
  }

  useEffect(() => {
    const storedToken = sessionStorage.getItem("controle-fiado-token");

    if (!storedToken) {
      setLoading(false);
      return;
    }

    setAuthToken(storedToken);

    fetchMe()
      .then((user) => {
        setAuthUser(user);
      })
      .catch(() => {
        sessionStorage.removeItem("controle-fiado-token");
        setAuthToken("");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!authUser) {
      return;
    }

    setLoading(true);
    Promise.all([fetchCustomers(), fetchSales(), fetchPayments(), fetchChargeOverview()])
      .then(([customerData, salesData, paymentData, overviewData]) => {
        setCustomers(customerData);
        if (customerData.length > 0) {
          setSelectedCustomerId(customerData[0].id);
        }
        setSales(salesData.slice(0, 3));
        setPayments(paymentData.slice(0, 3));
        setChargeOverview(overviewData);
        setError(null);
      })
      .catch((err: Error) => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [authUser]);

  useEffect(() => {
    if (!selectedCustomerId) {
      return;
    }

    fetchCustomerDetail(selectedCustomerId)
      .then((data) => {
        setCustomerDetail(data);
      })
      .catch((err: Error) => {
        setError(err.message);
      });

    fetchChargeMessages(selectedCustomerId)
      .then((data) => {
        setChargeMessages(data.slice(0, 5));
      })
      .catch((err: Error) => {
        setError(err.message);
      });
  }, [selectedCustomerId]);

  return (
    <div className="page-shell">
      <aside className="side-panel">
        <div className="eyebrow">Controle de Fiado</div>
        <h1>Mercadinho do Tonhao</h1>
        <p>Base real do sistema com API, banco e integracao futura com WhatsApp.</p>
        <AuthPanel
          user={authUser}
          onLogin={async (input) => {
            const result = await login(input);
            setAuthToken(result.token);
            sessionStorage.setItem("controle-fiado-token", result.token);
            const user = await fetchMe();
            setAuthUser(user);
          }}
        />
      </aside>

      <main className="content-panel">
        <header className="page-header">
          <div>
            <div className="eyebrow">Clientes</div>
            <h2>Base inicial conectada com API</h2>
          </div>
          <div className="status-card">
            <span className="status-dot" />
            Backend esperado em `http://127.0.0.1:3333`
          </div>
        </header>

        {!authUser && !loading ? <div className="empty-card">Faça login para acessar o sistema.</div> : null}
        {loading ? <div className="empty-card">Carregando clientes...</div> : null}
        {error ? <div className="empty-card error-card">{error}</div> : null}
        {!loading && !error && authUser ? (
          <>
            <section className="section-block">
              <div className="page-header page-header-section">
                <div>
                  <div className="eyebrow">Clientes</div>
                  <h2>Base operacional inicial</h2>
                </div>
              </div>
              <CustomerList customers={customers} />
            </section>

            {customerDetail ? (
              <CustomerDetailPanel
                customer={customerDetail}
                selectedCustomerId={selectedCustomerId}
                onCustomerChange={setSelectedCustomerId}
                options={customers.map((customer) => ({
                  id: customer.id,
                  name: customer.name
                }))}
              />
            ) : null}

            {authUser && selectedCustomerId ? (
              <section className="section-block operation-grid">
                <CreateSaleForm
                  customerId={selectedCustomerId}
                  createdById={authUser.id}
                  onCreated={async () => {
                    await refreshOperationalData(selectedCustomerId);
                  }}
                />
                <CreatePaymentForm
                  customerId={selectedCustomerId}
                  createdById={authUser.id}
                  onCreated={async () => {
                    await refreshOperationalData(selectedCustomerId);
                  }}
                />
              </section>
            ) : null}

            {selectedCustomerId ? (
              <ChargeAutomationPanel
                onCompleted={async () => {
                  await refreshChargeData(selectedCustomerId);
                }}
              />
            ) : null}

            {chargeOverview ? <ChargeOverviewPanel overview={chargeOverview} /> : null}

            {chargeMessages.length ? <ChargeMessageList messages={chargeMessages} /> : null}

            <section className="section-block">
              <div className="page-header page-header-section">
                <div>
                  <div className="eyebrow">Vendas</div>
                  <h2>Ultimas vendas fiado</h2>
                </div>
              </div>
              <RecentSalesList sales={sales} />
            </section>

            <section className="section-block">
              <div className="page-header page-header-section">
                <div>
                  <div className="eyebrow">Pagamentos</div>
                  <h2>Ultimos pagamentos</h2>
                </div>
              </div>
              <RecentPaymentsList payments={payments} />
            </section>
          </>
        ) : null}
      </main>
    </div>
  );
}
