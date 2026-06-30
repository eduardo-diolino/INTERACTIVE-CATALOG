import React, { useEffect, useState } from "react";
import type { SelectionItem } from "../types/catalog";
import { loadOrders, clearOrders } from "../utils/orders";

const PASSWORD = "QWEASD";

export default function SellerView() {
  const [authed, setAuthed] = useState(localStorage.getItem("seller_auth") === "true");
  const [pw, setPw] = useState("");
  const [error, setError] = useState("");

  if (!authed) {
    return (
      <div className="min-h-screen bg-[#F6F4F1] flex items-center justify-center">
        <div className="max-w-sm w-full mx-4 rounded-xl bg-white p-6 shadow-xl border border-black/10">
          <div className="flex items-center gap-3 mb-4">
            <img src="/assets/agna-logo.png" alt="Logo Agna Costa" className="h-10 w-auto" />
            <h1 className="text-lg font-medium text-black">Acesso do Vendedor</h1>
          </div>
          <label className="text-sm text-black/70">Senha</label>
          <input
            type="password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            className="w-full mt-1 px-3 py-2 rounded-md border border-black/20 bg-white"
            placeholder="Digite a senha"
          />
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          <div className="mt-4 flex justify-end gap-2">
            <a href="/" className="px-4 py-2 rounded-md border border-black/20 bg-white text-black">Cancelar</a>
            <button
              type="button"
              className="px-4 py-2 rounded-md bg-black text-white hover:bg-black/90"
              onClick={() => {
                if (pw === PASSWORD) {
                  localStorage.setItem("seller_auth", "true");
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

  const [orders, setOrders] = useState<SelectionItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!authed) return;
    setLoading(true);
    loadOrders()
      .then((items) => {
        setOrders(items);
        setErrorMsg("");
      })
      .catch((error) => {
        console.error(error);
        setErrorMsg("Não foi possível carregar as seleções.");
      })
      .finally(() => setLoading(false));
  }, [authed]);

  const handleClear = async () => {
    try {
      await clearOrders();
      setOrders([]);
    } catch (error) {
      console.error(error);
      alert("Não foi possível limpar as seleções. Tente novamente.");
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F4F1]">
      <header className="sticky top-0 z-40 backdrop-blur bg-[#F6F4F1]/80 border-b border-black/10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/assets/agna-logo.png" alt="Logo Agna Costa" className="h-10 w-auto" />
            <span className="text-lg font-medium text-black">Acesso do Vendedor</span>
          </div>
          <div className="flex items-center gap-2">
            <a href="/" className="px-3 py-2 rounded-md border border-black/10 bg-white text-black hover:bg-black/5">Voltar ao catálogo</a>
            <button
              type="button"
              className="px-3 py-2 rounded-md border border-black/10 bg-white text-black hover:bg-black/5"
              onClick={() => {
                localStorage.removeItem("seller_auth");
                setAuthed(false);
                setOrders([]);
              }}
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 pt-8 pb-16">
        <h1 className="text-2xl text-black mb-4">Seleções confirmadas</h1>
        {loading && <p className="text-black/70">Carregando seleções...</p>}
        {errorMsg && <p className="text-red-600">{errorMsg}</p>}
        {orders.length === 0 && !loading ? (
          <p className="text-black/60">Nenhuma seleção confirmada ainda.</p>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {orders.map((o, idx) => (
              <div key={idx} className="rounded-xl bg-white p-4 border border-black/10 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-black font-medium">{o.model}</p>
                    <p className="text-sm text-black/70">Tamanho: {o.size}</p>
                    <p className="text-sm text-black/70">Quantidade: {o.quantity}</p>
                    <p className="text-sm text-black/70">Valor: R$ {o.price.toFixed(2)}</p>
                    <p className="text-xs text-black/50">Confirmado em {new Date(o.timestamp).toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-black/70">Cor:</span>
                    <span className="inline-block w-6 h-6 rounded-full border border-black/10" style={{ backgroundColor: o.color.hex }} />
                    <span className="text-sm text-black/60">{o.color.name}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {orders.length > 0 && (
          <div className="mt-6">
            <button
              type="button"
              className="px-4 py-2 rounded-md border border-black/20 bg-white text-black hover:bg-black/5"
              onClick={handleClear}
            >
              Limpar seleções
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
