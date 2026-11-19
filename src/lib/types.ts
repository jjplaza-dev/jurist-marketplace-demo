export type Listing = {
  id: string;
  title: string;
  description: string | null;
  price: number | string;
  category: string;
  seller_email: string;
  image_url: string | null;
  location: string | null;
  created_at: string;
};
