const API_BASE_URL = "http://127.0.0.1:3333/api";
let authToken = "";

export function setAuthToken(token: string) {
  authToken = token;
}

export async function httpGet<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: authToken ? { Authorization: `Bearer ${authToken}` } : undefined
  });

  if (!response.ok) {
    throw new Error("Falha ao carregar dados da API.");
  }

  return response.json() as Promise<T>;
}

export async function httpPost<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {})
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { message?: string } | null;
    throw new Error(payload?.message ?? "Falha ao enviar dados para a API.");
  }

  return response.json() as Promise<T>;
}
