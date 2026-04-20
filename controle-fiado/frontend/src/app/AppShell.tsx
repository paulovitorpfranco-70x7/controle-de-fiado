import { Activity, HandCoins, House, LogOut, MessageCircle, Users, type LucideIcon } from "lucide-react";
import { useEffect, useState, type PropsWithChildren, type ReactNode } from "react";
import type { AuthUser } from "../features/auth/types/auth";
import type { AppSection } from "./types";

type AppShellProps = PropsWithChildren<{
  authUser: AuthUser;
  activeSection: AppSection;
  onNavigate: (section: AppSection) => void;
  onLogout?: () => void;
  sidebarFooter?: ReactNode;
  pageKey?: string;
}>;

const SIDEBAR_STORAGE_KEY = "controle-fiado-sidebar-collapsed";

const SECTION_LABELS: Array<{ id: AppSection; label: string; mobileLabel: string; icon: LucideIcon; ownerOnly?: boolean }> = [
  { id: "dashboard", label: "Dashboard", mobileLabel: "Inicio", icon: House },
  { id: "customers", label: "Clientes", mobileLabel: "Clientes", icon: Users },
  { id: "operations", label: "Operacoes", mobileLabel: "Vendas", icon: HandCoins },
  { id: "charges", label: "Cobrancas", mobileLabel: "Cobrar", icon: MessageCircle, ownerOnly: true },
  { id: "status", label: "Sistema", mobileLabel: "Sistema", icon: Activity, ownerOnly: true }
];

export function AppShell({ authUser, activeSection, onNavigate, onLogout, sidebarFooter, pageKey, children }: AppShellProps) {
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
  const [mobileChromeVisible, setMobileChromeVisible] = useState(true);
  const isOwner = authUser.role === "OWNER";

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(SIDEBAR_STORAGE_KEY, desktopCollapsed ? "1" : "0");
  }, [desktopCollapsed]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const mediaQuery = window.matchMedia("(max-width: 1180px)");
    let hideTimer: number | undefined;

    const clearHideTimer = () => {
      if (hideTimer !== undefined) {
        window.clearTimeout(hideTimer);
      }
    };

    const scheduleHide = () => {
      clearHideTimer();

      if (!mediaQuery.matches) {
        setMobileChromeVisible(true);
        return;
      }

      hideTimer = window.setTimeout(() => {
        setMobileChromeVisible(false);
      }, 2400);
    };

    const revealChrome = () => {
      setMobileChromeVisible(true);
      scheduleHide();
    };

    const handlePointerDown = () => {
      revealChrome();
    };

    const handleVisibilityChange = () => {
      if (!mediaQuery.matches) {
        setMobileChromeVisible(true);
        clearHideTimer();
        return;
      }

      scheduleHide();
    };

    revealChrome();
    window.addEventListener("pointerdown", handlePointerDown, { passive: true });
    window.addEventListener("resize", handleVisibilityChange);

    return () => {
      clearHideTimer();
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("resize", handleVisibilityChange);
    };
  }, []);

  useEffect(() => {
    setMobileChromeVisible(true);
  }, [activeSection]);

  function handleNavigate(section: AppSection) {
    onNavigate(section);
    setMenuOpen(false);
  }

  return (
    <div className={`page-shell ${desktopCollapsed ? "desktop-nav-collapsed" : ""} ${mobileChromeVisible ? "mobile-chrome-visible" : "mobile-chrome-hidden"}`}>
      <button className={`app-overlay ${menuOpen ? "visible" : ""}`} type="button" aria-label="Fechar menu" onClick={() => setMenuOpen(false)} />

      {onLogout ? (
        <button className="mobile-logout-button" type="button" aria-label="Sair do app" onClick={onLogout}>
          <LogOut className="mobile-logout-icon" strokeWidth={2.1} />
        </button>
      ) : null}

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
              <span className="app-nav-icon" aria-hidden="true">
                <section.icon className="app-nav-symbol" strokeWidth={2.1} />
              </span>
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

      <nav className="mobile-tab-bar" aria-label="Navegacao inferior">
        {SECTION_LABELS.filter((section) => !section.ownerOnly || isOwner).map((section) => (
          <button
            key={section.id}
            className={activeSection === section.id ? "active" : ""}
            type="button"
            aria-label={section.label}
            onClick={() => handleNavigate(section.id)}
          >
            <section.icon className="mobile-tab-icon" strokeWidth={2.1} />
            <span className="mobile-tab-label">{section.mobileLabel}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
