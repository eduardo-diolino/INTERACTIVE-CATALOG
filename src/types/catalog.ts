export interface ColorOption {
  name: string;
  hex: string; // HEX color code for swatch
  image?: string; // optional image representing this color variant
}

export type SizeOption = string;

export interface Product {
  id: string;
  image: string; // absolute public path, e.g. /assets/products/look1.jpg
  model: string;
  price: number;
  sizes: SizeOption[];
  colors: ColorOption[];
}

export interface SelectionItem {
  productId: string;
  model: string;
  size: SizeOption;
  color: ColorOption;
  price: number;
  quantity: number;
  timestamp: number;
}
