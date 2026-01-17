import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { CategoryService } from '../../services/category.service';
import { Category } from '../../models/category.model';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.css'],
  standalone: false
})
export class CategoriesComponent implements OnInit, OnDestroy {
  categories: Category[] = [];
  loading: boolean = true;
  errorMessage: string = '';
  private categoriesSubscription?: Subscription;

  newCategoryName: string = '';
  newCategoryDescription: string = '';
  newCategoryStatus: 'active' | 'inactive' = 'active';
  showAddForm: boolean = false;

  constructor(private categoryService: CategoryService) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  ngOnDestroy(): void {
    this.categoriesSubscription?.unsubscribe();
  }

  loadCategories(): void {
    this.loading = true;
    this.errorMessage = '';
    this.categoriesSubscription = this.categoryService.categories$.subscribe({
      next: (categories) => {
        this.categories = categories;
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load categories:', err);
        this.errorMessage = 'Failed to load categories.';
        this.loading = false;
      }
    });
  }

  toggleAddForm(): void {
    this.showAddForm = !this.showAddForm;
    if (!this.showAddForm) {
      this.resetForm();
    }
  }

  addCategory(): void {
    if (this.newCategoryName.trim()) {
      const newCategory: Omit<Category, 'id' | 'created_at' | 'last_modified'> = {
        name: this.newCategoryName,
        description: this.newCategoryDescription,
        productCount: 0,
        status: this.newCategoryStatus
      };

      this.categoryService.createCategory(newCategory).subscribe({
        next: (category) => {
          this.categoryService.addCategoryToState(category);
          this.resetForm();
          this.showAddForm = false;
        },
        error: (err) => {
          console.error('Failed to create category:', err);
          // For frontend-only, add to state anyway
          const createdCategory: Category = {
            id: Math.max(...this.categories.map(c => c.id), 0) + 1,
            ...newCategory,
            created_at: new Date(),
            last_modified: new Date()
          };
          this.categoryService.addCategoryToState(createdCategory);
          this.resetForm();
          this.showAddForm = false;
        }
      });
    }
  }

  deleteCategory(id: number): void {
    if (confirm('Are you sure you want to delete this category?')) {
      this.categoryService.deleteCategory(id).subscribe({
        next: () => {
          this.categoryService.removeCategoryFromState(id);
        },
        error: (err) => {
          console.error('Failed to delete category:', err);
          // For frontend-only, remove from state anyway
          this.categoryService.removeCategoryFromState(id);
        }
      });
    }
  }

  formatDate(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  resetForm(): void {
    this.newCategoryName = '';
    this.newCategoryDescription = '';
    this.newCategoryStatus = 'active';
  }
}
