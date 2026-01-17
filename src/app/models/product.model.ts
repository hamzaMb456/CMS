// Product model - defines the structure of product data
export interface Product {
  id: number;
  name: string;
  description: string;
  categoryId: number;
  categoryName: string;
  price: number;
  stock: number;
  image_url: string;
  status?: 'active' | 'inactive' | 'discontinued';
  created_at: Date;
  last_modified: Date;
}
