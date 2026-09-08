import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ItemService } from '../../../services/item';
import { Category, CategoryService } from '../../../services/category';
import { ItemCondition, ItemDto, ItemQueryParams } from '../../../models/item.model';
import { extractErrorMessage } from '../../../core/api-error.util';
import { resolveAssetUrl } from '../../../core/asset-url.util';
import { CONDITION_LABELS, CONDITION_OPTIONS } from '../item.constants';

@Component({
  selector: 'app-item-list',
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './item-list.html',
  styleUrl: './item-list.css'
})
export class ItemList implements OnInit {
  private itemService = inject(ItemService);
  private categoryService = inject(CategoryService);
  private fb = inject(FormBuilder);

  readonly conditionOptions = CONDITION_OPTIONS;
  readonly conditionLabels = CONDITION_LABELS;

  items = signal<ItemDto[]>([]);
  categories = signal<Category[]>([]);
  loading = signal(true);
  errorMessage = signal<string | null>(null);

  filters = this.fb.group({
    q: this.fb.nonNullable.control(''),
    categoryId: this.fb.control<number | null>(null),
    condition: this.fb.nonNullable.control<ItemCondition | ''>(''),
    minValue: this.fb.control<number | null>(null),
    maxValue: this.fb.control<number | null>(null),
    includeArchived: this.fb.nonNullable.control(false)
  });

  ngOnInit(): void {
    this.categoryService.getAll().subscribe({
      next: (categories) => this.categories.set(categories),
      error: () => {
        /* le categorie sono solo per il filtro: se falliscono, la lista funziona comunque */
      }
    });
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    const raw = this.filters.getRawValue();
    const params: ItemQueryParams = {
      q: raw.q.trim() || undefined,
      categoryId: raw.categoryId ?? undefined,
      condition: raw.condition || undefined,
      minValue: raw.minValue ?? undefined,
      maxValue: raw.maxValue ?? undefined,
      includeArchived: raw.includeArchived || undefined
    };

    this.itemService.getAll(params).subscribe({
      next: (items) => {
        this.items.set(items);
        this.loading.set(false);
      },
      error: (err) => {
        this.errorMessage.set(extractErrorMessage(err, 'Impossibile caricare gli oggetti.'));
        this.loading.set(false);
      }
    });
  }

  resetFilters(): void {
    this.filters.reset({
      q: '',
      categoryId: null,
      condition: '',
      minValue: null,
      maxValue: null,
      includeArchived: false
    });
    this.load();
  }

  remove(item: ItemDto): void {
    if (!confirm(`Eliminare "${item.title}"? L'operazione non e' reversibile.`)) {
      return;
    }
    this.itemService.delete(item.id).subscribe({
      next: () => this.items.update((list) => list.filter((i) => i.id !== item.id)),
      error: (err) =>
        this.errorMessage.set(extractErrorMessage(err, "Impossibile eliminare l'oggetto."))
    });
  }

  primaryImageUrl(item: ItemDto): string | null {
    const first = [...item.images].sort((a, b) => a.displayOrder - b.displayOrder)[0];
    return first ? resolveAssetUrl(first.url) : null;
  }
}
