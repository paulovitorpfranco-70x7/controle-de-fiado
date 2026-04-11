const API_BASE_URL = "http://127.0.0.1:3333/api";

export async function httpGet<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`);

  if (!response.ok) {
    throw new Error("Falha ao carregar dados da API.");
  }

  return response.json() as Promise<T>;
}
