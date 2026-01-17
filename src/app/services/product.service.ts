import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { Product } from '../models/product.model';
import { environment } from '../../environments/environment';

// Service to handle product data operations
@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private productsSubject = new BehaviorSubject<Product[]>([]);
  public products$ = this.productsSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadProducts();
  }

  // Load all products
  private loadProducts(): void {
    this.getProducts().subscribe({
      next: (products) => {
        this.productsSubject.next(products);
      },
      error: (err) => {
        console.error('Failed to load products:', err);
        // Load mock data if API fails
        this.loadMockProducts();
      }
    });
  }

  // Get all products from API
  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${environment.apiBaseUrl}/products`);
  }

  // Get products by category
  getProductsByCategory(categoryId: number): Observable<Product[]> {
    return this.http.get<Product[]>(`${environment.apiBaseUrl}/products/category/${categoryId}`);
  }

  // Get single product by ID
  getProductById(id: number): Observable<Product> {
    return this.http.get<Product>(`${environment.apiBaseUrl}/products/${id}`);
  }

  // Create new product
  createProduct(product: Omit<Product, 'id' | 'created_at' | 'last_modified'>): Observable<Product> {
    return this.http.post<Product>(`${environment.apiBaseUrl}/products`, product);
  }

  // Update product
  updateProduct(id: number, product: Partial<Product>): Observable<Product> {
    return this.http.put<Product>(`${environment.apiBaseUrl}/products/${id}`, product);
  }

  // Delete product
  deleteProduct(id: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiBaseUrl}/products/${id}`);
  }

  // Add product to local state
  addProductToState(product: Product): void {
    const currentProducts = this.productsSubject.value;
    this.productsSubject.next([...currentProducts, product]);
  }

  // Update product in local state
  updateProductInState(id: number, product: Partial<Product>): void {
    const currentProducts = this.productsSubject.value;
    const updatedProducts = currentProducts.map(p =>
      p.id === id ? { ...p, ...product, last_modified: new Date() } : p
    );
    this.productsSubject.next(updatedProducts);
  }

  // Remove product from local state
  removeProductFromState(id: number): void {
    const currentProducts = this.productsSubject.value;
    this.productsSubject.next(currentProducts.filter(p => p.id !== id));
  }

  // Load mock products (for frontend-only development)
  private loadMockProducts(): void {
    const mockProducts: Product[] = [
      {
        id: 1,
        name: 'Wireless Headphones',
        description: 'High-quality Bluetooth wireless headphones with noise cancellation',
        categoryId: 1,
        categoryName: 'Electronics',
        price: 129.99,
        stock: 45,
        image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=300&fit=crop',
        status: 'active',
        created_at: new Date('2024-01-15'),
        last_modified: new Date('2024-01-20')
      },
      {
        id: 2,
        name: 'Smart Watch',
        description: 'Feature-rich smartwatch with fitness tracking and notifications',
        categoryId: 1,
        categoryName: 'Electronics',
        price: 249.99,
        stock: 32,
        image_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&h=300&fit=crop',
        status: 'active',
        created_at: new Date('2024-01-16'),
        last_modified: new Date('2024-01-21')
      },
      {
        id: 3,
        name: 'Vintage T-Shirt',
        description: 'Comfortable 100% cotton vintage style t-shirt',
        categoryId: 2,
        categoryName: 'Clothing',
        price: 29.99,
        stock: 120,
        image_url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&h=300&fit=crop',
        status: 'active',
        created_at: new Date('2024-01-10'),
        last_modified: new Date('2024-01-19')
      },
      {
        id: 4,
        name: 'Running Shoes',
        description: 'Professional running shoes with advanced cushioning technology',
        categoryId: 4,
        categoryName: 'Sports & Outdoors',
        price: 89.99,
        stock: 78,
        image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&h=300&fit=crop',
        status: 'active',
        created_at: new Date('2024-01-12'),
        last_modified: new Date('2024-01-22')
      },
      {
        id: 5,
        name: 'Yoga Mat',
        description: 'Non-slip yoga mat perfect for all types of exercises',
        categoryId: 4,
        categoryName: 'Sports & Outdoors',
        price: 34.99,
        stock: 56,
        image_url: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=500&h=300&fit=crop',
        status: 'active',
        created_at: new Date('2024-01-08'),
        last_modified: new Date('2024-01-18')
      },
      {
        id: 6,
        name: 'Desk Lamp',
        description: 'LED desk lamp with adjustable brightness and color temperature',
        categoryId: 3,
        categoryName: 'Home & Garden',
        price: 49.99,
        stock: 40,
        image_url: 'https://images.unsplash.com/photo-1565636192335-14c46fa1120d?w=500&h=300&fit=crop',
        status: 'active',
        created_at: new Date('2024-01-20'),
        last_modified: new Date('2024-01-23')
      },
      {
        id: 7,
        name: 'The Great Gatsby',
        description: 'Classic novel by F. Scott Fitzgerald',
        categoryId: 5,
        categoryName: 'Books & Media',
        price: 14.99,
        stock: 32,
        image_url: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=500&h=300&fit=crop',
        status: 'active',
        created_at: new Date('2024-01-05'),
        last_modified: new Date('2024-01-21')
      },
      {
        id: 8,
        name: 'Face Moisturizer',
        description: 'Hydrating face moisturizer with SPF 30 protection',
        categoryId: 6,
        categoryName: 'Health & Beauty',
        price: 39.99,
        stock: 89,
        image_url: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=500&h=300&fit=crop',
        status: 'active',
        created_at: new Date('2024-01-20'),
        last_modified: new Date('2024-01-23')
      }
    ];
    this.productsSubject.next(mockProducts);
  }
}
