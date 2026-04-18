import { useEffect, useState, type PropsWithChildren, type ReactNode } from "react";
import type { AuthUser } from "../features/auth/types/auth";
import type { AppSection } from "./types";

type AppShellProps = PropsWithChildren<{
  authUser: AuthUser;
  activeSection: AppSection;
  onNavigate: (section: AppSection) => void;
  sidebarFooter?: ReactNode;
  pageKey?: string;
}>;

const SIDEBAR_STORAGE_KEY = "controle-fiado-sidebar-collapsed";

const SECTION_LABELS: Array<{ id: AppSection; label: string; shortLabel: string; ownerOnly?: boolean }> = [
  { id: "dashboard", label: "Dashboard", shortLabel: "Ds" },
  { id: "customers", label: "Clientes", shortLabel: "Cl" },
  { id: "operations", label: "Operacoes", shortLabel: "Op" },
  { id: "charges", label: "Cobrancas", shortLabel: "Cb", ownerOnly: true },
  { id: "status", label: "Sistema", shortLabel: "St", ownerOnly: true }
];

export function AppShell({ authUser, activeSection, onNavigate, sidebarFooter, pageKey, children }: AppShellProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [desktopCollapsed, setDesktopCollapsed] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }

    const stored = window.localStorage.getItem(SIDEBAR_STORAGE_KEY);

    if (stored !== null) {
      return stored === "1";
    }

    return window.innerWidth >= 1180;
  });
  const isOwner = authUser.role === "OWNER";

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(SIDEBAR_STORAGE_KEY, desktopCollapsed ? "1" : "0");
  }, [desktopCollapsed]);

  function handleNavigate(section: AppSection) {
    onNavigate(section);
    setMenuOpen(false);
  }

  return (
    <div className={`page-shell ${desktopCollapsed ? "desktop-nav-collapsed" : ""}`}>
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

      <aside className={`side-panel ${menuOpen ? "menu-open" : ""} ${desktopCollapsed ? "is-collapsed" : ""}`}>
        <div className="side-panel-topbar">
          <button
            className="desktop-shell-toggle"
            type="button"
            aria-label={desktopCollapsed ? "Expandir menu lateral" : "Recolher menu lateral"}
            aria-pressed={desktopCollapsed}
            onClick={() => setDesktopCollapsed((current) => !current)}
          >
            <span aria-hidden="true">{desktopCollapsed ? ">" : "<"}</span>
          </button>
        </div>

        <div className="brand-block">
          <div className="brand-media">
            <img src="/assets/logo-mercadinho-tonhao-full-cropped.png" alt="Mercadinho do Tonhao" className="brand-image brand-image-full" />
            <img src="/assets/logo-mercadinho-tonhao-icon-transparent.png" alt="" className="brand-image brand-image-compact" />
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
              aria-label={section.label}
              title={desktopCollapsed ? section.label : undefined}
              onClick={() => handleNavigate(section.id)}
            >
              <span className="app-nav-icon" aria-hidden="true">{section.shortLabel}</span>
              <span className="app-nav-label">{section.label}</span>
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
