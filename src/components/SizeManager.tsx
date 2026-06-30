import React, { useState } from "react";

interface SizeManagerProps {
  sizes: string[];
  onChange: (sizes: string[]) => void;
}

export const SizeManager: React.FC<SizeManagerProps> = ({ sizes, onChange }) => {
  const [draft, setDraft] = useState("");

  const handleAdd = () => {
    const value = draft.trim();
    if (!value) return;
    if (sizes.some((size) => size.toLowerCase() === value.toLowerCase())) {
      setDraft("");
      return;
    }
    onChange([...sizes, value]);
    setDraft("");
  };

  const handleRemove = (value: string) => {
    onChange(sizes.filter((size) => size !== value));
  };

  const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleAdd();
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <input
          type="text"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ex.: PP, 38, Unique..."
          className="flex-1 px-3 py-2 rounded-md border border-black/20 bg-white text-sm"
        />
        <button
          type="button"
          onClick={handleAdd}
          className="px-3 py-2 rounded-md bg-black text-white hover:bg-black/90"
        >
          Adicionar
        </button>
      </div>

      {sizes.length === 0 ? (
        <p className="text-sm text-black/50">Nenhum tamanho cadastrado ainda.</p>
      ) : (
        <ul className="flex flex-wrap gap-2">
          {sizes.map((size) => (
            <li key={size} className="flex items-center gap-2 px-3 py-1 rounded-md border border-black/20 bg-white text-sm">
              <span>{size}</span>
              <button
                type="button"
                onClick={() => handleRemove(size)}
                className="text-xs text-red-600 hover:underline"
              >
                Remover
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
