import type { SelectionItem } from "../types/catalog";
import { fetchOrders, submitOrders, clearOrdersApi } from "../api/backend";

export async function loadOrders(): Promise<SelectionItem[]> {
  try {
    return await fetchOrders();
  } catch (error) {
    console.error("Erro ao carregar seleções:", error);
    throw error;
  }
}

export async function addOrders(items: SelectionItem[]): Promise<void> {
  try {
    await submitOrders(items);
  } catch (error) {
    console.error("Erro ao registrar seleções:", error);
    throw error;
  }
}

export async function clearOrders(): Promise<void> {
  try {
    await clearOrdersApi();
  } catch (error) {
    console.error("Erro ao limpar seleções:", error);
    throw error;
  }
}
