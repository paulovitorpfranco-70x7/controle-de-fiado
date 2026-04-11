import { useEffect, useState } from "react";
import { fetchCustomerDetail } from "../features/customers/api/fetch-customer-detail";
import { CustomerDetailPanel } from "../features/customers/components/CustomerDetailPanel";
import { fetchCustomers } from "../features/customers/api/fetch-customers";
import { CustomerList } from "../features/customers/components/CustomerList";
import type { CustomerDetail } from "../features/customers/types/customer-detail";
import type { Customer } from "../features/customers/types/customer";
import { fetchPayments } from "../features/payments/api/fetch-payments";
import { RecentPaymentsList } from "../features/payments/components/RecentPaymentsList";
import type { Payment } from "../features/payments/types/payment";
import { fetchSales } from "../features/sales/api/fetch-sales";
import { RecentSalesList } from "../features/sales/components/RecentSalesList";
import type { Sale } from "../features/sales/types/sale";

export function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");
  const [customerDetail, setCustomerDetail] = useState<CustomerDetail | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([fetchCustomers(), fetchSales(), fetchPayments()])
      .then(([customerData, salesData, paymentData]) => {
        setCustomers(customerData);
        if (customerData.length > 0) {
          setSelectedCustomerId(customerData[0].id);
        }
        setSales(salesData.slice(0, 3));
        setPayments(paymentData.slice(0, 3));
        setError(null);
      })
      .catch((err: Error) => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

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
  }, [selectedCustomerId]);

  return (
    <div className="page-shell">
      <aside className="side-panel">
        <div className="eyebrow">Controle de Fiado</div>
        <h1>Mercadinho do Tonhao</h1>
        <p>Base real do sistema com API, banco e integracao futura com WhatsApp.</p>
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

        {loading ? <div className="empty-card">Carregando clientes...</div> : null}
        {error ? <div className="empty-card error-card">{error}</div> : null}
        {!loading && !error ? (
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
