import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ListingService } from '../../../services/listing';
import { CategoryService, Category } from '../../../services/category';
import { ItemService } from '../../../services/item';
import { ItemDto } from '../../../models/item.model';
import { CreateListingRequest } from '../../../models/listing.model';
import { extractErrorMessage } from '../../../core/api-error.util';

@Component({
  selector: 'app-create-listing',
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './create-listing.html',
  styleUrl: './create-listing.css'
})
export class CreateListing implements OnInit {
  private listingService = inject(ListingService);
  private categoryService = inject(CategoryService);
  private itemService = inject(ItemService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  categories = signal<Category[]>([]);
  items = signal<ItemDto[]>([]);
  selectedCategoryIds = signal<number[]>([]);

  loading = signal(true);
  submitting = signal(false);
  errorMessage = signal<string | null>(null);

  form = this.fb.group({
    city: this.fb.nonNullable.control('', [Validators.required, Validators.maxLength(120)]),
    itemId: this.fb.control<number | null>(null, Validators.required)
  });

  ngOnInit(): void {
    this.categoryService.getAll().subscribe({
      next: (categories) => this.categories.set(categories.filter((c) => c.active)),
      error: () => {
        /* senza categorie il campo resta vuoto: l'errore viene mostrato al salvataggio */
      }
    });

    this.itemService.getAll().subscribe({
      next: (items) => {
        this.items.set(items.filter((i) => !i.archived));
        this.loading.set(false);
      },
      error: (err) => {
        this.errorMessage.set(extractErrorMessage(err, 'Impossibile caricare i tuoi oggetti.'));
        this.loading.set(false);
      }
    });
  }

  toggleCategory(id: number): void {
    this.selectedCategoryIds.update((ids) =>
      ids.includes(id) ? ids.filter((c) => c !== id) : [...ids, id]
    );
  }

  isCategorySelected(id: number): boolean {
    return this.selectedCategoryIds().includes(id);
  }

  submit(): void {
    this.errorMessage.set(null);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    if (this.selectedCategoryIds().length === 0) {
      this.errorMessage.set('Seleziona almeno una categoria che accetti in cambio.');
      return;
    }
    if (this.submitting()) {
      return;
    }

    this.submitting.set(true);

    const raw = this.form.getRawValue();
    const request: CreateListingRequest = {
      itemId: raw.itemId!,
      city: raw.city.trim(),
      acceptedCategoryIds: this.selectedCategoryIds()
    };

    this.listingService.create(request).subscribe({
      next: (listing) => {
        this.submitting.set(false);
        this.router.navigate(['/listings', listing.id]);
      },
      error: (err) => {
        this.submitting.set(false);
        this.errorMessage.set(extractErrorMessage(err, "Impossibile pubblicare l'annuncio."));
      }
    });
  }
}
