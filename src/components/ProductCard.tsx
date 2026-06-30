import React, { useMemo, useState } from "react";
import type { Product, ColorOption, SizeOption, SelectionItem } from "../types/catalog";
import { ColorSwatch } from "./ColorSwatch";
import { SizeSelector } from "./SizeSelector";
import { ConfirmationModal } from "./ConfirmationModal";
import { addOrders } from "../utils/orders";

interface Props {
  product: Product;
}

const MIN_QTY = 1;

export const ProductCard: React.FC<Props> = ({ product }) => {
  // Multiple selections
  const productImage = typeof product.image === "string" && product.image.trim().length > 0 ? product.image.trim() : product.image;

  const [selectedColors, setSelectedColors] = useState<ColorOption[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<SizeOption[]>([]);
  const [quantity, setQuantity] = useState<number>(1);
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [colorPreviewMap, setColorPreviewMap] = useState<Record<string, boolean>>({});

  const canConfirm = selectedColors.length > 0 && selectedSizes.length > 0 && quantity >= MIN_QTY;

  const colorNames = useMemo(() => new Set(selectedColors.map((c) => c.name)), [selectedColors]);

  const toggleColor = (c: ColorOption) => {
    setSelectedColors((prev) => {
      const exists = prev.some((x) => x.name === c.name);
      if (exists) {
        return prev.filter((x) => x.name !== c.name);
      }
      return [...prev, c];
    });
  };

  const toggleColorPreview = (colorName: string) => {
    setColorPreviewMap((prev) => ({
      ...prev,
      [colorName]: !prev[colorName],
    }));
  };

  const clampQuantity = (value: number) => {
    if (Number.isNaN(value) || value < MIN_QTY) return MIN_QTY;
    return Math.floor(value);
  };

  const handleConfirm = async () => {
    if (!canConfirm) return;
    const timestamp = Date.now();
    const items: SelectionItem[] = [];

    const fallbackImage = (typeof product.image === 'string' && product.image.trim().length > 0) ? product.image.trim() : undefined;

    selectedSizes.forEach((size) => {
      selectedColors.forEach((color) => {
        const colorImage = typeof color.image === 'string' && color.image.trim().length > 0 ? color.image.trim() : fallbackImage;

        items.push({
          productId: product.id,
          model: product.model,
          size,
          color: {
            ...color,
            ...(colorImage ? { image: colorImage } : {}),
          },
          price: product.price,
          quantity,
          timestamp,
        });
      });
    });


    try {
      setSubmitting(true);
      await addOrders(items);
      setOpen(false);
      setSelectedColors([]);
      setSelectedSizes([]);
      setQuantity(1);
    } catch (error) {
      console.error("Erro ao confirmar seleção:", error);
      alert("Não foi possível confirmar a seleção. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="group rounded-2xl overflow-hidden bg-white shadow-sm border border-black/10 hover:shadow-lg transition">
      <div className="relative aspect-[4/5] overflow-hidden">
        <img
          src={productImage}
          alt={`Modelo ${product.model}`}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
        <div className="absolute top-3 left-3 px-2 py-1 rounded-md bg-white/80 text-xs text-black/70">Agna Costa</div>
      </div>

      <div className="p-4 space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-medium text-black">{product.model}</h3>
            <p className="text-sm text-black/60">R$ {product.price.toFixed(2)}</p>
          </div>
          <img src="/assets/agna-logo.png" alt="Logo Agna Costa" className="h-8 w-auto" />
        </div>

        <div>
          <p className="text-sm text-black/70 mb-2">Cores disponíveis</p>
          <div className="space-y-3">
            {product.colors.map((c) => {
              const isSelected = colorNames.has(c.name);
              const showPreview = !!colorPreviewMap[c.name];
              const hasImage = typeof c.image === "string" && c.image.trim().length > 0;
              return (
                <div key={c.name} className="rounded-lg border border-black/5 p-3 bg-white/60">
                  <ColorSwatch
                    color={c}
                    selected={isSelected}
                    onClick={() => toggleColor(c)}
                  />
                  {hasImage && (
                    <div className="mt-3 space-y-2">
                      <button
                        type="button"
                        onClick={() => toggleColorPreview(c.name)}
                        className="text-xs px-3 py-1 rounded-md border border-black/20 text-black hover:bg-black/5"
                      >
                        {showPreview ? "Ocultar foto" : "Exibir foto"}
                      </button>
                      {showPreview && (
                        <img
                          src={c.image}
                          alt={`Foto da cor ${c.name}`}
                          className="w-full rounded-md border border-black/10 object-cover"
                        />
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          {selectedColors.length > 0 && (
            <p className="mt-2 text-xs text-black/60">{selectedColors.length} cor(es) selecionada(s)</p>
          )}
        </div>

        <div>
          <p className="text-sm text-black/70 mb-2">Tamanhos</p>
          <SizeSelector
            sizes={product.sizes}
            multiple
            values={selectedSizes}
            onChangeMulti={setSelectedSizes}
          />
        </div>

        <div>
          <p className="text-sm text-black/70 mb-2">Quantidade</p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="w-9 h-9 rounded-md border border-black/20 bg-white text-lg text-black hover:bg-black/5 disabled:opacity-40"
              onClick={() => setQuantity((q) => clampQuantity(q - 1))}
              disabled={quantity <= MIN_QTY}
            >
              −
            </button>
            <input
              type="number"
              min={MIN_QTY}
              value={quantity}
              onChange={(e) => {
                const value = Number(e.target.value);
                setQuantity(clampQuantity(value));
              }}
              onBlur={(e) => {
                const value = Number(e.target.value);
                setQuantity(clampQuantity(value));
              }}
              className="w-16 text-center px-2 py-2 rounded-md border border-black/20 bg-white"
            />
            <button
              type="button"
              className="w-9 h-9 rounded-md border border-black/20 bg-white text-lg text-black hover:bg-black/5"
              onClick={() => setQuantity((q) => clampQuantity(q + 1))}
            >
              +
            </button>
          </div>
        </div>

        <div className="pt-2">
          <button
            type="button"
            disabled={!canConfirm}
            onClick={() => setOpen(true)}
            className={`w-full px-4 py-2 rounded-md transition ${
              canConfirm ? "bg-black text-white hover:bg-black/90" : "bg-black/10 text-black/50 cursor-not-allowed"
            }`}
          >
            Confirmar seleção
          </button>
          {submitting && <p className="mt-2 text-xs text-black/60">Enviando seleção...</p>}
        </div>
      </div>

      <ConfirmationModal open={open} onClose={() => setOpen(false)} onConfirm={handleConfirm} />
      {/* TODO: substituir alert por feedback visual elegante */}
      {submitting && <div className="absolute inset-0 bg-white/60 flex items-center justify-center text-black">Processando...</div>}
    </div>
  );
};
