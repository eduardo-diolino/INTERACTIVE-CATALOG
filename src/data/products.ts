import type { Product } from "../types/catalog";

export const products: Product[] = [
  {
    id: "look-1",
    image: "/assets/products/look1.jpg",
    model: "Vestido Longo Clássico",
    price: 349.9,
    sizes: ["P", "M", "G", "GG"],
    colors: [
      { name: "Preto", hex: "#000000", image: "/assets/products/look1.jpg" },
      { name: "Off-White", hex: "#F6F4F1", image: "/assets/products/look1.jpg" },
      { name: "Azul Marinho", hex: "#0A2540", image: "/assets/products/look1.jpg" },
      { name: "Verde Oliva", hex: "#556B2F", image: "/assets/products/look1.jpg" },
    ],
  },
  {
    id: "look-2",
    image: "/assets/products/look2.jpg",
    model: "Vestido Floral Suave",
    price: 299.0,
    sizes: ["P", "M", "G"],
    colors: [
      { name: "Rose", hex: "#C08080", image: "/assets/products/look2.jpg" },
      { name: "Champagne", hex: "#E7D7C9", image: "/assets/products/look2.jpg" },
      { name: "Verde Sálvia", hex: "#B7C4A1", image: "/assets/products/look2.jpg" },
      { name: "Azul Céu", hex: "#9EC5E8", image: "/assets/products/look2.jpg" },
    ],
  },
  {
    id: "look-3",
    image: "/assets/products/look3.jpg",
    model: "Vestido Preto Elegante",
    price: 389.9,
    sizes: ["PP", "P", "M", "G"],
    colors: [
      { name: "Preto", hex: "#0B0B0B", image: "/assets/products/look3.jpg" },
      { name: "Carvão", hex: "#333333", image: "/assets/products/look3.jpg" },
      { name: "Grafite", hex: "#4F4F4F", image: "/assets/products/look3.jpg" },
      { name: "Prata", hex: "#C0C0C0", image: "/assets/products/look3.jpg" },
    ],
  },
];
