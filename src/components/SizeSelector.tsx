import React from "react";
import type { SizeOption } from "../types/catalog";

interface Props {
  sizes: SizeOption[];
  value?: SizeOption; // single selection
  values?: SizeOption[]; // multiple selection
  multiple?: boolean;
  onChange?: (size: SizeOption) => void; // single selection change
  onChangeMulti?: (sizes: SizeOption[]) => void; // multiple selection change
}

export const SizeSelector: React.FC<Props> = ({ sizes, value, values, multiple, onChange, onChangeMulti }) => {
  if (multiple) {
    const set = new Set((values ?? []).map((size) => size.trim()));
    const toggle = (s: SizeOption) => {
      const key = s.trim();
      if (!key) return;
      const next = new Set(set);
      next.has(key) ? next.delete(key) : next.add(key);
      onChangeMulti?.(Array.from(next));
    };
    return (
      <div className="flex flex-wrap gap-2">
        {sizes.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => toggle(s)}
            className={`px-3 py-1 rounded-md border text-sm transition ${
              set.has(s) ? "bg-black text-white border-black" : "bg-white text-black border-black/20 hover:border-black/40"
            }`}
            aria-pressed={set.has(s)}
          >
            {s}
          </button>
        ))}
      </div>
    );
  }

  // fallback: single selection
  return (
    <div className="flex flex-wrap gap-2">
      {sizes.map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => onChange?.(s)}
          className={`px-3 py-1 rounded-md border text-sm transition ${
            value?.trim() === s.trim() ? "bg-black text-white border-black" : "bg-white text-black border-black/20 hover:border-black/40"
          }`}
        >
          {s}
        </button>
      ))}
    </div>
  );
};
