import { useState } from "react";
import type { AuthUser } from "../types/auth";

type AuthPanelProps = {
  user: AuthUser | null;
  onLogin: (input: { login: string; password: string }) => Promise<void>;
  onLogout?: () => void;
};

export function AuthPanel({ user, onLogin, onLogout }: AuthPanelProps) {
  const [loginValue, setLoginValue] = useState("tonhao");
  const [password, setPassword] = useState("tonhao123");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await onLogin({
        login: loginValue,
        password
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao autenticar.");
    } finally {
      setSubmitting(false);
    }
  }

  if (user) {
    return (
      <div className="auth-panel">
        <div className="eyebrow">Sessao</div>
        <strong>{user.name}</strong>
        <div className="customer-meta">
          {user.login} | {user.role}
        </div>
        <button className="auth-button" type="button" onClick={onLogout}>
          Sair
        </button>
      </div>
    );
  }

  return (
    <form className="auth-panel auth-form" onSubmit={handleSubmit}>
      <div className="eyebrow">Entrar</div>
      <input className="customer-selector" value={loginValue} onChange={(event) => setLoginValue(event.target.value)} />
      <input
        className="customer-selector"
        type="password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
      />
      <button className="auth-button" type="submit" disabled={submitting}>
        {submitting ? "Entrando..." : "Entrar"}
      </button>
      {error ? <div className="error-copy">{error}</div> : null}
    </form>
  );
}
