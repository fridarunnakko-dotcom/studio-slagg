export type WorkStatus =
  | { type: "for_sale"; price: number }
  | { type: "for_sale_rent"; price: number; rentPrice: number }
  | { type: "rent_only"; rentPrice: number }
  | { type: "sold" };

export interface Work {
  id: string;
  title: string;
  medium: string;
  dimensions: string;
  year: number;
  status: WorkStatus;
  image?: string;
}

export const SELECTED_WORKS: Work[] = [
  {
    id: "001",
    title: "Utan titel I",
    medium: "Spackel och pigment på duk",
    dimensions: "80 × 100 cm",
    year: 2024,
    status: { type: "for_sale_rent", price: 18000, rentPrice: 900 },
  },
  {
    id: "002",
    title: "Avsättning",
    medium: "Spackel och pigment på duk",
    dimensions: "60 × 80 cm",
    year: 2024,
    status: { type: "for_sale", price: 12000 },
  },
  {
    id: "003",
    title: "Rest",
    medium: "Spackel och pigment på panel",
    dimensions: "40 × 50 cm",
    year: 2023,
    status: { type: "sold" },
  },
  {
    id: "004",
    title: "Skikt",
    medium: "Spackel och pigment på duk",
    dimensions: "100 × 120 cm",
    year: 2024,
    status: { type: "rent_only", rentPrice: 1200 },
  },
];
