// Category model - defines the structure of our category data
export interface Category {
  id: number;
  name: string;
  description: string;
  image_url: string;
  productCount: number;
  status?: 'active' | 'inactive';
  created_at: Date;
  last_modified: Date;
}
