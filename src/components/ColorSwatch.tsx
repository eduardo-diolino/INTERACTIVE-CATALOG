import React from "react";
import type { ColorOption } from "../types/catalog";

interface Props {
  color: ColorOption;
  selected?: boolean;
  onClick?: () => void;
}

export const ColorSwatch: React.FC<Props> = ({ color, selected, onClick }) => {
  const preview = color.image;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Cor ${color.name}`}
      className={`group flex items-center gap-3 p-2 rounded-md transition 
        ${selected ? "bg-white/70 shadow ring-1 ring-black/10" : "hover:bg-white/50"}`}
    >
      <span className="relative inline-flex items-center justify-center w-8 h-8">
        <span
          className={`absolute inset-0 rounded-full border border-black/10 shadow-sm 
          ${selected ? "ring-2 ring-offset-2 ring-black/20" : ""}`}
          style={{ backgroundColor: color.hex }}
        />
        {preview && (
          <img
            src={preview}
            alt={`Foto ${color.name}`}
            className="relative z-10 w-6 h-6 rounded-full object-cover border border-white/70"
          />
        )}
      </span>
      <span className="text-sm text-black/80 group-hover:text-black">{color.name}</span>
    </button>
  );
};
