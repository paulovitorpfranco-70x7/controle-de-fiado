import { useState, type PropsWithChildren, type ReactNode } from "react";
import type { AuthUser } from "../features/auth/types/auth";
import type { AppSection } from "./types";

type AppShellProps = PropsWithChildren<{
  authUser: AuthUser;
  activeSection: AppSection;
  onNavigate: (section: AppSection) => void;
  sidebarFooter?: ReactNode;
  pageKey?: string;
}>;

const SECTION_LABELS: Array<{ id: AppSection; label: string; ownerOnly?: boolean }> = [
  { id: "dashboard", label: "Dashboard" },
  { id: "customers", label: "Clientes" },
  { id: "operations", label: "Operacoes" },
  { id: "charges", label: "Cobrancas", ownerOnly: true },
  { id: "status", label: "Sistema", ownerOnly: true }
];

export function AppShell({ authUser, activeSection, onNavigate, sidebarFooter, pageKey, children }: AppShellProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const isOwner = authUser.role === "OWNER";

  function handleNavigate(section: AppSection) {
    onNavigate(section);
    setMenuOpen(false);
  }

  return (
    <div className="page-shell">
      <button
        className="mobile-menu-button"
        type="button"
        aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen((current) => !current)}
      >
        <span />
        <span />
        <span />
      </button>

      <button className={`app-overlay ${menuOpen ? "visible" : ""}`} type="button" aria-label="Fechar menu" onClick={() => setMenuOpen(false)} />

      <aside className={`side-panel ${menuOpen ? "menu-open" : ""}`}>
        <div className="brand-block">
          <div className="brand-media">
            <img src="/assets/logo-mercadinho-tonhao-full.png" alt="Mercadinho do Tonhao" className="brand-image brand-image-full" />
          </div>
          <div className="eyebrow">Controle de Fiado</div>
          <h1>Mercadinho do Tonhao</h1>
          <p>Painel operacional com foco em consulta rapida, lancamento e leitura de saldo em poucos toques.</p>
        </div>

        <div className="operator-card">
          <span className={`badge ${isOwner ? "warning" : "success"}`}>{authUser.role}</span>
          <div>
            <strong>{authUser.name}</strong>
            <div className="customer-meta">{authUser.login}</div>
          </div>
        </div>

        <nav className="app-nav" aria-label="Navegacao principal">
          {SECTION_LABELS.filter((section) => !section.ownerOnly || isOwner).map((section) => (
            <button
              key={section.id}
              className={activeSection === section.id ? "active" : ""}
              type="button"
              onClick={() => handleNavigate(section.id)}
            >
              {section.label}
            </button>
          ))}
        </nav>

        {sidebarFooter}
      </aside>

      <main className="content-panel">
        <div key={pageKey} className="page-scene">
          {children}
        </div>
      </main>
    </div>
  );
}
