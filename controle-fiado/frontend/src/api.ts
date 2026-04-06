import type { Customer } from "./types";

const API_BASE_URL = "http://127.0.0.1:3333/api";

export async function fetchCustomers(): Promise<Customer[]> {
  const response = await fetch(`${API_BASE_URL}/customers`);
  if (!response.ok) {
    throw new Error("Falha ao carregar clientes.");
  }
  return response.json();
}

