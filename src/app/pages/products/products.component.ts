import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { ProductService } from '../../services/product.service';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css'],
  standalone: false
})
export class ProductsComponent implements OnInit, OnDestroy {
  products: Product[] = [];
  loading: boolean = true;
  errorMessage: string = '';
  private productsSubscription?: Subscription;

  newProductName: string = '';
  newProductDescription: string = '';
  newProductCategoryId: number = 1;
  newProductPrice: number = 0;
  newProductStock: number = 0;
  newProductImageUrl: string = '';
  newProductStatus: 'active' | 'inactive' | 'discontinued' = 'active';
  showAddForm: boolean = false;

  editingProductId: number | null = null;
  editProductName: string = '';
  editProductDescription: string = '';
  editProductCategoryId: number = 1;
  editProductPrice: number = 0;
  editProductStock: number = 0;
  editProductImageUrl: string = '';
  editProductStatus: 'active' | 'inactive' | 'discontinued' = 'active';
  showEditForm: boolean = false;

  // Categories for dropdown (mock data)
  categories = [
    { id: 1, name: 'Electronics' },
    { id: 2, name: 'Clothing' },
    { id: 3, name: 'Home & Garden' },
    { id: 4, name: 'Sports & Outdoors' },
    { id: 5, name: 'Books & Media' },
    { id: 6, name: 'Health & Beauty' }
  ];

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  ngOnDestroy(): void {
    this.productsSubscription?.unsubscribe();
  }

  loadProducts(): void {
    this.loading = true;
    this.errorMessage = '';
    this.productsSubscription = this.productService.products$.subscribe({
      next: (products) => {
        this.products = products;
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load products:', err);
        this.errorMessage = 'Failed to load products.';
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

  addProduct(): void {
    if (this.newProductName.trim() && this.newProductPrice > 0) {
      const selectedCategory = this.categories.find(c => c.id === this.newProductCategoryId);
      const newProduct: Omit<Product, 'id' | 'created_at' | 'last_modified'> = {
        name: this.newProductName,
        description: this.newProductDescription,
        categoryId: this.newProductCategoryId,
        categoryName: selectedCategory?.name || 'Unknown',
        price: this.newProductPrice,
        stock: this.newProductStock,
        image_url: this.newProductImageUrl,
        status: this.newProductStatus
      };

      this.productService.createProduct(newProduct).subscribe({
        next: (product) => {
          this.productService.addProductToState(product);
          this.resetForm();
          this.showAddForm = false;
        },
        error: (err) => {
          console.error('Failed to create product:', err);
          // For frontend-only, add to state anyway
          const createdProduct: Product = {
            id: Math.max(...this.products.map(p => p.id), 0) + 1,
            ...newProduct,
            created_at: new Date(),
            last_modified: new Date()
          };
          this.productService.addProductToState(createdProduct);
          this.resetForm();
          this.showAddForm = false;
        }
      });
    }
  }

  openEditForm(product: Product): void {
    this.editingProductId = product.id;
    this.editProductName = product.name;
    this.editProductDescription = product.description;
    this.editProductCategoryId = product.categoryId;
    this.editProductPrice = product.price;
    this.editProductStock = product.stock;
    this.editProductImageUrl = product.image_url;
    this.editProductStatus = product.status || 'active';
    this.showEditForm = true;
  }

  closeEditForm(): void {
    this.showEditForm = false;
    this.editingProductId = null;
    this.resetEditForm();
  }

  updateProduct(): void {
    if (this.editingProductId && this.editProductName.trim() && this.editProductPrice > 0) {
      const selectedCategory = this.categories.find(c => c.id === this.editProductCategoryId);
      const updatedProduct: Partial<Product> = {
        name: this.editProductName,
        description: this.editProductDescription,
        categoryId: this.editProductCategoryId,
        categoryName: selectedCategory?.name || 'Unknown',
        price: this.editProductPrice,
        stock: this.editProductStock,
        image_url: this.editProductImageUrl,
        status: this.editProductStatus
      };

      this.productService.updateProduct(this.editingProductId, updatedProduct).subscribe({
        next: (product) => {
          this.productService.updateProductInState(this.editingProductId!, updatedProduct);
          this.closeEditForm();
        },
        error: (err) => {
          console.error('Failed to update product:', err);
          // For frontend-only, update state anyway
          this.productService.updateProductInState(this.editingProductId!, updatedProduct);
          this.closeEditForm();
        }
      });
    }
  }

  deleteProduct(id: number): void {
    if (confirm('Are you sure you want to delete this product?')) {
      this.productService.deleteProduct(id).subscribe({
        next: () => {
          this.productService.removeProductFromState(id);
        },
        error: (err) => {
          console.error('Failed to delete product:', err);
          // For frontend-only, remove from state anyway
          this.productService.removeProductFromState(id);
        }
      });
    }
  }

  getCategoryName(categoryId: number): string {
    const category = this.categories.find(c => c.id === categoryId);
    return category?.name || 'Unknown';
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

  formatPrice(price: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  }

  getStockStatus(stock: number): string {
    if (stock === 0) return 'Out of Stock';
    if (stock <= 10) return 'Low Stock';
    return 'In Stock';
  }

  resetForm(): void {
    this.newProductName = '';
    this.newProductDescription = '';
    this.newProductCategoryId = 1;
    this.newProductPrice = 0;
    this.newProductStock = 0;
    this.newProductImageUrl = '';
    this.newProductStatus = 'active';
  }

  resetEditForm(): void {
    this.editProductName = '';
    this.editProductDescription = '';
    this.editProductCategoryId = 1;
    this.editProductPrice = 0;
    this.editProductStock = 0;
    this.editProductImageUrl = '';
    this.editProductStatus = 'active';
  }
}
