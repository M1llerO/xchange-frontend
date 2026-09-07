import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CategoryService, Category } from '../../../services/category';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.css'
})
export class CategoriesComponent implements OnInit {
  categories = signal<Category[]>([]);
  selectedCategory = signal<Category | null>(null);
  loading = signal(false);
  showForm = signal(false);
  isEditing = signal(false);

  formData = signal({
    name: '',
    slug: '',
    description: ''
  });

  constructor(private categoryService: CategoryService) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.loading.set(true);
    this.categoryService.getAll().subscribe({
      next: (data) => {
        this.categories.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  openNewForm(): void {
    this.isEditing.set(false);
    this.formData.set({ name: '', slug: '', description: '' });
    this.showForm.set(true);
  }

  openEditForm(category: Category): void {
    this.isEditing.set(true);
    this.selectedCategory.set(category);
    this.formData.set({
      name: category.name,
      slug: category.slug,
      description: category.description || ''
    });
    this.showForm.set(true);
  }

  closeForm(): void {
    this.showForm.set(false);
    this.isEditing.set(false);
    this.selectedCategory.set(null);
    this.formData.set({ name: '', slug: '', description: '' });
  }

  submitForm(): void {
    const form = this.formData();
    
    if (!form.name.trim() || !form.slug.trim()) {
      alert('Nome e Slug sono obbligatori');
      return;
    }

    if (this.isEditing() && this.selectedCategory()) {
      this.categoryService.update(this.selectedCategory()!.id, {
        name: form.name,
        slug: form.slug,
        description: form.description || null
      }).subscribe({
        next: () => {
          this.closeForm();
          this.loadCategories();
        }
      });
    } else {
      this.categoryService.create({
        name: form.name,
        slug: form.slug,
        description: form.description || undefined
      }).subscribe({
        next: () => {
          this.closeForm();
          this.loadCategories();
        }
      });
    }
  }

  toggleActive(category: Category): void {
    if (category.active) {
      this.categoryService.deactivate(category.id).subscribe({
        next: () => this.loadCategories()
      });
    } else {
      this.categoryService.activate(category.id).subscribe({
        next: () => this.loadCategories()
      });
    }
  }

  generateSlug(name: string): void {
    const slug = name
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]/g, '');
    
    this.formData.update(form => ({ ...form, slug }));
  }
}
