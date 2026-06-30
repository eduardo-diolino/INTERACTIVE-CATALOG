import React, { useEffect, useMemo, useState } from "react";
import type { Product, ColorOption } from "../types/catalog";
import { loadProducts, saveAllProducts } from "../utils/products";
import { compressImageFile } from "../utils/image";
import { SizeManager } from "../components/SizeManager";

const PASSWORD = "QWEASD";

function emptyColor(): ColorOption { return { name: "", hex: "#000000", image: "" }; }

function newProduct(): Product {
  return {
    id: `model-${Date.now()}`,
    image: "/assets/products/look1.jpg",
    model: "Novo Modelo",
    price: 0,
    sizes: ["P", "M"],
    colors: [emptyColor()],
  };
}

export default function Admin() {
  const [authed, setAuthed] = useState(localStorage.getItem("admin_auth") === "true");
  const [pw, setPw] = useState("");
  const [error, setError] = useState("");

  const [items, setItems] = useState<Product[]>([]);
  const [savedMsg, setSavedMsg] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string>("");

  useEffect(() => {
    if (!authed) return;
    setLoading(true);
    loadProducts()
      .then((products) => {
        setItems(products);
        setErrorMsg("");
      })
      .catch((error) => {
        console.error(error);
        setErrorMsg("Não foi possível carregar o catálogo.");
      })
      .finally(() => setLoading(false));
  }, [authed]);

  const updateItem = (idx: number, patch: Partial<Product>) => {
    setItems((prev) => {
      const next = [...prev];
      const current = next[idx];
      if (!current) return prev;
      const merged: Product = {
        ...current,
        ...patch,
      } as Product;
      merged.sizes = merged.sizes.map((size) => size.trim()).filter((size, i, arr) => size.length > 0 && arr.indexOf(size) === i);
      next[idx] = merged;
      return next;
    });
  };

  const handleImageFile = async (idx: number, file?: File) => {
    if (!file) return;
    try {
      const dataUrl = await compressImageFile(file, {
        maxWidth: 1600,
        maxHeight: 1600,
      });
      updateItem(idx, { image: dataUrl });
      setErrorMsg("");
    } catch (error) {
      console.error("Erro ao processar imagem do modelo:", error);
      setErrorMsg("Não foi possível processar a imagem do modelo.");
    }
  };

  const handleColorImageFile = async (pIndex: number, cIndex: number, file?: File) => {
    if (!file) return;
    try {
      const dataUrl = await compressImageFile(file, {
        maxWidth: 1024,
        maxHeight: 1024,
      });
      setItems((prev) => {
        const next = [...prev];
        const product = next[pIndex];
        if (!product) return prev;
        const colors = [...product.colors];
        colors[cIndex] = { ...colors[cIndex], image: dataUrl };
        next[pIndex] = { ...product, colors };
        return next;
      });
      setErrorMsg("");
    } catch (error) {
      console.error("Erro ao processar foto da cor:", error);
      setErrorMsg("Não foi possível processar a foto da cor.");
    }
  };

  const updateSizes = (idx: number, sizes: string[]) => {
    const normalized = sizes.map((size) => size.trim()).filter((size, i, arr) => size.length > 0 && arr.indexOf(size) === i);
    updateItem(idx, { sizes: normalized });
  };

  const addColor = (idx: number) => {
    const it = items[idx];
    updateItem(idx, { colors: [...it.colors, emptyColor()] });
  };

  const removeColor = (idx: number, cIndex: number) => {
    const it = items[idx];
    const nextColors = it.colors.filter((_, i) => i !== cIndex);
    updateItem(idx, { colors: nextColors.length ? nextColors : [emptyColor()] });
  };

  const addModel = () => setItems((prev) => [newProduct(), ...prev]);

  const removeModel = (idx: number) => {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const saveAll = async () => {
    try {
      setLoading(true);
      await saveAllProducts(items.map((item) => ({
        ...item,
        id: item.id || `model-${Date.now()}`,
      })));
      setSavedMsg("Catálogo salvo!");
      setTimeout(() => setSavedMsg(""), 2000);
    } catch (error) {
      console.error(error);
      setErrorMsg("Não foi possível salvar o catálogo.");
    } finally {
      setLoading(false);
    }
  };

  if (!authed) {
    return (
      <div className="min-h-screen bg-[#F6F4F1] flex items-center justify-center">
        <div className="max-w-sm w-full mx-4 rounded-xl bg-white p-6 shadow-xl border border-black/10">
          <div className="flex items-center gap-3 mb-4">
            <img src="/assets/agna-logo.png" alt="Logo Agna Costa" className="h-10 w-auto" />
            <h1 className="text-lg font-medium text-black">Acesso do Admin</h1>
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
                  localStorage.setItem("admin_auth", "true");
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
            <span className="text-lg font-medium text-black">Admin do Catálogo</span>
          </div>
          <div className="flex items-center gap-2">
            <a href="/" className="px-3 py-2 rounded-md border border-black/10 bg-white text-black hover:bg-black/5">Voltar</a>
            <button
              type="button"
              className="px-3 py-2 rounded-md border border-black/10 bg-white text-black hover:bg-black/5"
              onClick={() => {
                localStorage.removeItem("admin_auth");
                setAuthed(false);
              }}
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 pt-8 pb-16 space-y-6">
        <div className="flex items-center gap-3">
          <button
            onClick={addModel}
            className="px-4 py-2 rounded-md bg-black text-white hover:bg-black/90 disabled:opacity-50"
            disabled={loading}
          >
            Adicionar modelo
          </button>
          <button
            onClick={saveAll}
            className="px-4 py-2 rounded-md border border-black/20 bg-white text-black hover:bg-black/5 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Salvando..." : "Salvar catálogo"}
          </button>
          {savedMsg && <span className="text-sm text-black/70">{savedMsg}</span>}
          {errorMsg && <span className="text-sm text-red-600">{errorMsg}</span>}
        </div>

        <div className="grid grid-cols-1 gap-6">
          {loading && !items.length ? (
            <div className="text-black/70">Carregando catálogo...</div>
          ) : (
            items.map((it, idx) => {
              const productId = it.id ?? `model-${idx}`;
              return (
                <div key={productId} className="rounded-2xl bg-white p-4 border border-black/10 shadow-sm">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <div className="aspect-[4/5] rounded-md overflow-hidden border border-black/10 bg-black/5">
                        <img src={it.image} alt={`Modelo ${it.model}`} className="w-full h-full object-cover" />
                      </div>
                      <div className="mt-3 flex items-center gap-2">
                        <input
                          type="text"
                          value={it.image}
                          onChange={(e) => updateItem(idx, { image: e.target.value })}
                          className="flex-1 px-3 py-2 rounded-md border border-black/20 bg-white text-sm"
                          placeholder="/assets/products/look1.jpg ou DataURL"
                        />
                        <label className="px-3 py-2 rounded-md border border-black/20 bg-white text-black cursor-pointer">
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              await handleImageFile(idx, file);
                              e.target.value = "";
                            }}
                          />
                          Carregar imagem
                        </label>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="text-sm text-black/70">Modelo</label>
                        <input
                          type="text"
                          value={it.model}
                          onChange={(e) => updateItem(idx, { model: e.target.value })}
                          className="w-full px-3 py-2 rounded-md border border-black/20 bg-white"
                        />
                      </div>

                      <div>
                        <label className="text-sm text-black/70">Valor (R$)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={it.price}
                          onChange={(e) => updateItem(idx, { price: Number(e.target.value) })}
                          className="w-full px-3 py-2 rounded-md border border-black/20 bg-white"
                        />
                      </div>

                      <div>
                        <p className="text-sm text-black/70 mb-2">Tamanhos</p>
                        <SizeManager
                          sizes={it.sizes}
                          onChange={(sizes) => updateSizes(idx, sizes)}
                        />
                      </div>

                      <div>
                        <p className="text-sm text-black/70 mb-2">Cores</p>
                        <div className="space-y-2">
                          {it.colors.map((c, cIndex) => (
                            <div key={cIndex} className="flex flex-col sm:flex-row sm:items-center gap-2">
                              <div className="flex items-center gap-2">
                                <input type="color" value={c.hex} onChange={(e) => {
                                  const colors = [...it.colors];
                                  colors[cIndex] = { ...colors[cIndex], hex: e.target.value };
                                  updateItem(idx, { colors });
                                }} />
                                <input
                                  type="text"
                                  placeholder="Nome"
                                  value={c.name}
                                  onChange={(e) => {
                                    const colors = [...it.colors];
                                    colors[cIndex] = { ...colors[cIndex], name: e.target.value };
                                    updateItem(idx, { colors });
                                  }}
                                  className="flex-1 px-3 py-2 rounded-md border border-black/20 bg-white text-sm"
                                />
                              </div>
                              <div className="flex items-center gap-2">
                                {c.image && (
                                  <img
                                    src={c.image}
                                    alt={`Pré-visualização ${c.name || `cor ${cIndex + 1}`}`}
                                    className="h-12 w-12 rounded-md object-cover border border-black/10"
                                  />
                                )}
                                <input
                                  type="text"
                                  placeholder="/assets/... ou DataURL"
                                  value={c.image || ""}
                                  onChange={(e) => {
                                    const colors = [...it.colors];
                                    colors[cIndex] = { ...colors[cIndex], image: e.target.value };
                                    updateItem(idx, { colors });
                                  }}
                                  className="flex-1 px-3 py-2 rounded-md border border-black/20 bg-white text-sm"
                                />
                                <label className="px-3 py-2 rounded-md border border-black/20 bg-white text-black cursor-pointer">
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={async (e) => {
                                      const file = e.target.files?.[0];
                                      await handleColorImageFile(idx, cIndex, file);
                                      e.target.value = "";
                                    }}
                                  />
                                  Foto da cor
                                </label>
                                <button type="button" className="px-3 py-2 rounded-md border border-black/20 bg-white text-black" onClick={() => removeColor(idx, cIndex)}>Remover</button>
                              </div>
                            </div>
                          ))}
                          <button type="button" className="px-3 py-2 rounded-md border border-black/20 bg-white text-black" onClick={() => addColor(idx)}>Adicionar cor</button>
                        </div>
                      </div>

                      <div className="pt-2">
                        <button type="button" className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700" onClick={() => removeModel(idx)}>Remover modelo</button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
}
