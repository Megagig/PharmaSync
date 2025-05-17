export interface Product {
  id: string;
  name: string;
  price: number;
  description?: string;
  category?: string;
  sku: string;
  stock: number;
}
