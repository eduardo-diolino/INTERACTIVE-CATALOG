import type { Product, SelectionItem } from "../types/catalog";

const API_BASE = "https://backend.youware.com";

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: init?.body
      ? {
          "Content-Type": "application/json",
          ...(init.headers || {}),
        }
      : init?.headers,
  });

  let payload: ApiResponse<T> | undefined;
  try {
    payload = await response.json();
  } catch (error) {
    throw new Error("Não foi possível ler a resposta do servidor.");
  }

  if (!response.ok || !payload?.success) {
    const message = payload?.error || `Falha na requisição (${response.status})`;
    throw new Error(message);
  }

  return payload.data as T;
}

export async function fetchProducts(): Promise<Product[]> {
  return request<Product[]>("/products");
}

export async function replaceProducts(products: Product[]): Promise<{ updated: number; deleted: number }> {
  const normalized = products.map((product) => ({
    ...product,
    sizes: product.sizes.map((size) => size.trim()).filter((size) => size.length > 0),
  }));
  return request<{ updated: number; deleted: number }>("/products/bulk", {
    method: "PUT",
    body: JSON.stringify(normalized),
  });
}

export async function clearProducts(): Promise<{ deleted: number }> {
  return request<{ deleted: number }>("/products", { method: "DELETE" });
}

export async function fetchOrders(): Promise<SelectionItem[]> {
  return request<SelectionItem[]>("/orders");
}

export async function submitOrders(items: SelectionItem[]): Promise<{ inserted: number }> {
  return request<{ inserted: number }>("/orders", {
    method: "POST",
    body: JSON.stringify(items),
  });
}

export async function clearOrdersApi(): Promise<{ deleted: number }> {
  return request<{ deleted: number }>("/orders", { method: "DELETE" });
}
