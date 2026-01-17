import { Component } from '@angular/core';

interface Category {
  id: number;
  name: string;
  description: string;
  productCount: number;
}

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.css'],
  standalone: false
})
export class CategoriesComponent {
  categories: Category[] = [
    {
      id: 1,
      name: 'Electronics',
      description: 'Electronic devices and gadgets',
      productCount: 45
    },
    {
      id: 2,
      name: 'Clothing',
      description: 'Apparel and fashion items',
      productCount: 120
    },
    {
      id: 3,
      name: 'Home & Garden',
      description: 'Home and garden products',
      productCount: 78
    },
    {
      id: 4,
      name: 'Sports & Outdoors',
      description: 'Sports and outdoor equipment',
      productCount: 56
    },
    {
      id: 5,
      name: 'Books & Media',
      description: 'Books, movies, and media items',
      productCount: 32
    },
    {
      id: 6,
      name: 'Health & Beauty',
      description: 'Health and beauty products',
      productCount: 89
    }
  ];

  newCategoryName: string = '';
  newCategoryDescription: string = '';
  showAddForm: boolean = false;

  toggleAddForm(): void {
    this.showAddForm = !this.showAddForm;
    if (!this.showAddForm) {
      this.resetForm();
    }
  }

  addCategory(): void {
    if (this.newCategoryName.trim()) {
      const newCategory: Category = {
        id: Math.max(...this.categories.map(c => c.id)) + 1,
        name: this.newCategoryName,
        description: this.newCategoryDescription,
        productCount: 0
      };
      this.categories.push(newCategory);
      this.resetForm();
      this.showAddForm = false;
    }
  }

  deleteCategory(id: number): void {
    if (confirm('Are you sure you want to delete this category?')) {
      this.categories = this.categories.filter(c => c.id !== id);
    }
  }

  resetForm(): void {
    this.newCategoryName = '';
    this.newCategoryDescription = '';
  }
}
