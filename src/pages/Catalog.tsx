import React, { useEffect, useState } from "react";
import { ProductCard } from "../components/ProductCard";
import { Link } from "react-router-dom";
import type { Product } from "../types/catalog";
import { loadProducts } from "../utils/products";

const PASSWORD = "KDM";

export default function Catalog() {
  const [list, setList] = useState<Product[]>([]);
  const [authed, setAuthed] = useState(localStorage.getItem("catalog_auth") === "true");
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string>("");

  useEffect(() => {
    if (!authed) return;
    setLoading(true);
    loadProducts()
      .then((products) => {
        setList(products);
        setLoadError("");
      })
      .catch((err) => {
        console.error(err);
        setLoadError("Não foi possível carregar o catálogo.");
      })
      .finally(() => setLoading(false));
  }, [authed]);

  if (!authed) {
    return (
      <div className="min-h-screen bg-[#F6F4F1] flex items-center justify-center">
        <div className="max-w-sm w-full mx-4 rounded-xl bg-white p-6 shadow-xl border border-black/10">
          <div className="flex items-center gap-3 mb-4">
            <img src="/assets/agna-logo.png" alt="Logo Agna Costa" className="h-10 w-auto" />
            <h1 className="text-lg font-medium text-black">Acesso ao Catálogo</h1>
          </div>
          <label className="text-sm text-black/70">Senha</label>
          <input
            type="password"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full mt-1 px-3 py-2 rounded-md border border-black/20 bg-white"
            placeholder="Digite a senha"
          />
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              className="px-4 py-2 rounded-md border border-black/20 bg-white text-black"
              onClick={() => {
                setInput("");
                setError("");
              }}
            >
              Limpar
            </button>
            <button
              type="button"
              className="px-4 py-2 rounded-md bg-black text-white hover:bg-black/90"
              onClick={() => {
                if (input === PASSWORD) {
                  localStorage.setItem("catalog_auth", "true");
                  setAuthed(true);
                } else {
                  setError("Senha incorreta.");
                }
              }}
            >
              Entrar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F6F4F1]">
      <header className="sticky top-0 z-40 backdrop-blur bg-[#F6F4F1]/80 border-b border-black/10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/assets/agna-logo.png" alt="Logo Agna Costa" className="h-10 w-auto" />
            <span
              className="text-lg font-medium text-black"
              style={{
                fontWeight: "bold",
                fontStyle: "italic",
                color: "#e81cf8"
              }}>CATÁLOGO AGNA COSTA</span>
          </div>
          <nav className="flex items-center gap-3">
            <Link to="/admin" className="px-3 py-2 rounded-md border border-black/10 bg-white text-black hover:bg-black/5">Admin</Link>
            <Link to="/vendedor" className="px-3 py-2 rounded-md border border-black/10 bg-white text-black hover:bg-black/5">Visão do vendedor</Link>
            <button
              type="button"
              className="px-3 py-2 rounded-md border border-black/10 bg-white text-black hover:bg-black/5"
              onClick={() => {
                localStorage.removeItem("catalog_auth");
                setAuthed(false);
                setInput("");
              }}
            >
              Sair
            </button>
          </nav>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 pt-8 pb-16">
        <h1 className="text-2xl text-black mb-4">Escolha o modelo, cor e tamanho</h1>
        {loading && <p className="text-black/70">Carregando catálogo...</p>}
        {loadError && <p className="text-red-600">{loadError}</p>}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {list.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </main>
      <footer className="border-t border-black/10">
        <div className="max-w-6xl mx-auto px-4 py-6 text-sm text-black/60">
          © {new Date().getFullYear()} Agna Costa — catálogo de demonstração.
        </div>
      </footer>
    </div>
  );
}
