import { useEffect, useState } from "react";
import { fetchCustomers } from "../features/customers/api/fetch-customers";
import { CustomerList } from "../features/customers/components/CustomerList";
import type { Customer } from "../features/customers/types/customer";

export function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCustomers()
      .then((data) => {
        setCustomers(data);
        setError(null);
      })
      .catch((err: Error) => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

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
        {!loading && !error ? <CustomerList customers={customers} /> : null}
      </main>
    </div>
  );
}
