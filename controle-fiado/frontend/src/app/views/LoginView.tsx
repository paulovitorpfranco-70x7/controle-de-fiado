import { AuthPanel } from "../../features/auth/components/AuthPanel";
import { OperationNotice } from "../../shared/components/OperationNotice";
import type { NoticeState } from "../types";

type LoginViewProps = {
  environmentLabel: string;
  notice: NoticeState | null;
  onLogin: (input: { login: string; password: string }) => Promise<void>;
};

export function LoginView({ environmentLabel, notice, onLogin }: LoginViewProps) {
  return (
    <main className="login-page login-page-clean">
      <section className="login-card login-card-centered">
        <img src="/assets/logo-mercadinho-tonhao-icon-transparent.png" alt="Mercadinho do Tonhao" className="login-logo" />

        <div className="login-brand-block">
          <h1>Mercadinho do Tonhao</h1>
          <p className="page-description">Entre com seu login para acessar o painel operacional.</p>
        </div>

        <AuthPanel user={null} onLogout={() => {}} onLogin={onLogin} />

        <div className="login-footer-meta">
          <span>{environmentLabel}</span>
        </div>
      </section>

      {notice ? <OperationNotice tone={notice.tone} message={notice.message} /> : null}
    </main>
  );
}
