import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { Category } from '../models/category.model';
import { environment } from '../../environments/environment';

// Service to handle category data operations
@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private categoriesSubject = new BehaviorSubject<Category[]>([]);
  public categories$ = this.categoriesSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadCategories();
  }

  // Load all categories
  private loadCategories(): void {
    this.getCategories().subscribe({
      next: (categories) => {
        this.categoriesSubject.next(categories);
      },
      error: (err) => {
        console.error('Failed to load categories:', err);
        // Load mock data if API fails
        this.loadMockCategories();
      }
    });
  }

  // Get all categories from API
  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${environment.apiBaseUrl}/categories`);
  }

  // Get single category by ID
  getCategoryById(id: number): Observable<Category> {
    return this.http.get<Category>(`${environment.apiBaseUrl}/categories/${id}`);
  }

  // Create new category
  createCategory(category: Omit<Category, 'id' | 'created_at' | 'last_modified'>): Observable<Category> {
    return this.http.post<Category>(`${environment.apiBaseUrl}/categories`, category);
  }

  // Update category
  updateCategory(id: number, category: Partial<Category>): Observable<Category> {
    return this.http.put<Category>(`${environment.apiBaseUrl}/categories/${id}`, category);
  }

  // Delete category
  deleteCategory(id: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiBaseUrl}/categories/${id}`);
  }

  // Add category to local state
  addCategoryToState(category: Category): void {
    const currentCategories = this.categoriesSubject.value;
    this.categoriesSubject.next([...currentCategories, category]);
  }

  // Update category in local state
  updateCategoryInState(id: number, category: Partial<Category>): void {
    const currentCategories = this.categoriesSubject.value;
    const updatedCategories = currentCategories.map(c =>
      c.id === id ? { ...c, ...category, last_modified: new Date() } : c
    );
    this.categoriesSubject.next(updatedCategories);
  }

  // Remove category from local state
  removeCategoryFromState(id: number): void {
    const currentCategories = this.categoriesSubject.value;
    this.categoriesSubject.next(currentCategories.filter(c => c.id !== id));
  }

  // Load mock categories (for frontend-only development)
  private loadMockCategories(): void {
    const mockCategories: Category[] = [
      {
        id: 1,
        name: 'Electronics',
        description: 'Electronic devices and gadgets',
        image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=300&fit=crop',
        productCount: 45,
        status: 'active',
        created_at: new Date('2024-01-15'),
        last_modified: new Date('2024-01-20')
      },
      {
        id: 2,
        name: 'Clothing',
        description: 'Apparel and fashion items',
        image_url: 'https://images.unsplash.com/photo-1542272604-787c62d465d1?w=500&h=300&fit=crop',
        productCount: 120,
        status: 'active',
        created_at: new Date('2024-01-10'),
        last_modified: new Date('2024-01-18')
      },
      {
        id: 3,
        name: 'Home & Garden',
        description: 'Home and garden products',
        image_url: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=500&h=300&fit=crop',
        productCount: 78,
        status: 'active',
        created_at: new Date('2024-01-12'),
        last_modified: new Date('2024-01-19')
      },
      {
        id: 4,
        name: 'Sports & Outdoors',
        description: 'Sports and outdoor equipment',
        image_url: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=500&h=300&fit=crop',
        productCount: 56,
        status: 'active',
        created_at: new Date('2024-01-08'),
        last_modified: new Date('2024-01-17')
      },
      {
        id: 5,
        name: 'Books & Media',
        description: 'Books, movies, and media items',
        image_url: 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=500&h=300&fit=crop',
        productCount: 32,
        status: 'inactive',
        created_at: new Date('2024-01-05'),
        last_modified: new Date('2024-01-21')
      },
      {
        id: 6,
        name: 'Health & Beauty',
        description: 'Health and beauty products',
        image_url: 'https://images.unsplash.com/photo-1596462502278-af242a95b598?w=500&h=300&fit=crop',
        productCount: 89,
        status: 'active',
        created_at: new Date('2024-01-20'),
        last_modified: new Date('2024-01-22')
      }
    ];
    this.categoriesSubject.next(mockCategories);
  }
}
