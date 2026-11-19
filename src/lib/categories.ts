// Must match the CHECK constraint on listings.category in supabase-schema.sql
export const CATEGORIES = [
  "Vehicles",
  "Property Rentals",
  "Apparel",
  "Classifieds",
  "Electronics",
  "Entertainment",
  "Family",
  "Free Stuff",
  "Garden & Outdoor",
  "Hobbies",
  "Home Goods",
  "Home Improvement",
  "Home Sales",
  "Musical Instruments",
  "Office Supplies",
  "Pet Supplies",
  "Sporting Goods",
  "Toys & Games",
  "Buy and sell groups",
] as const;

export type Category = (typeof CATEGORIES)[number];

export function isCategory(value: string | undefined): value is Category {
  return !!value && (CATEGORIES as readonly string[]).includes(value);
}
