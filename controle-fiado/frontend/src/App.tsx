import { useEffect, useState } from "react";
import { fetchCustomers } from "./api";
import type { Customer } from "./types";

function formatMoney(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  }).format(value);
}

export function App() {
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

        {!loading && !error ? (
          <section className="card-list">
            {customers.map((customer) => (
              <article key={customer.id} className="customer-card">
                <div className="customer-main">
                  <div>
                    <div className="customer-name">{customer.name}</div>
                    <div className="customer-meta">{customer.phone}</div>
                  </div>
                  <div className={customer.openBalance > 0 ? "badge warning" : "badge success"}>
                    {customer.openBalance > 0 ? "Em aberto" : "Sem saldo"}
                  </div>
                </div>
                <div className="customer-grid">
                  <div>
                    <span className="label">Saldo</span>
                    <strong>{formatMoney(customer.openBalance)}</strong>
                  </div>
                  <div>
                    <span className="label">Limite</span>
                    <strong>{customer.creditLimit ? formatMoney(customer.creditLimit) : "Nao definido"}</strong>
                  </div>
                  <div>
                    <span className="label">Endereco</span>
                    <strong>{customer.address ?? "Nao informado"}</strong>
                  </div>
                </div>
              </article>
            ))}
          </section>
        ) : null}
      </main>
    </div>
  );
}
