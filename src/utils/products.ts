import type { Product } from "../types/catalog";
import { products as seedProducts } from "../data/products";
import { fetchProducts, replaceProducts } from "../api/backend";

let cache: Product[] | null = null;

export async function loadProducts(): Promise<Product[]> {
  if (cache) return cache;
  try {
    const list = await fetchProducts();
    cache = list;
    return list;
  } catch (error) {
    console.error("Erro ao carregar produtos do backend:", error);
    cache = seedProducts;
    return seedProducts;
  }
}

export async function saveAllProducts(products: Product[]): Promise<void> {
  try {
    await replaceProducts(products);
    cache = products;
  } catch (error) {
    console.error("Erro ao salvar produtos:", error);
    throw error;
  }
}

export function clearProductCache() {
  cache = null;
}
