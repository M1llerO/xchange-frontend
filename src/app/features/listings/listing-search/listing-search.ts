import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ListingService } from '../../../services/listing';
import { CategoryService, Category } from '../../../services/category';
import { AuthService } from '../../../services/auth';
import { environment } from '../../../../environments/environment';
import { ListingSearchDto } from '../../../models/listing.model';

@Component({
  selector: 'app-listing-search',
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './listing-search.html',
  styleUrl: './listing-search.css'
})
export class ListingSearch implements OnInit {
  private listingService = inject(ListingService);
  private categoryService = inject(CategoryService);
  protected authService = inject(AuthService);
  private fb = inject(FormBuilder);

  private filesBaseUrl = environment.apiUrl.replace(/\/api\/?$/, '');

  categories = signal<Category[]>([]);
  results = signal<ListingSearchDto[]>([]);
  featured = signal<ListingSearchDto[]>([]);
  loading = signal(true);
  errorMessage = signal<string | null>(null);

  form = this.fb.nonNullable.group({
    keyword: [''],
    categoryId: [''],
    minPrice: [''],
    maxPrice: ['']
  });

  ngOnInit(): void {
    this.categoryService.getAll().subscribe({
      next: (categories) => this.categories.set(categories.filter((c) => c.active)),
      error: () => {}
    });
    this.search(true);
  }

  imageUrl(listing: ListingSearchDto): string | null {
    return listing.primaryImageUrl ? `${this.filesBaseUrl}${listing.primaryImageUrl}` : null;
  }

  search(isInitialLoad = false): void {
    this.loading.set(true);
    this.errorMessage.set(null);
    const { keyword, categoryId, minPrice, maxPrice } = this.form.getRawValue();
    this.listingService
      .search({
        keyword: keyword || undefined,
        categoryId: categoryId ? Number(categoryId) : undefined,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined
      })
      .subscribe({
        next: (listings) => {
          this.results.set(listings);
          if (isInitialLoad) {
            // il primo caricamento (senza filtri) alimenta anche la striscia "in evidenza"
            const sorted = [...listings].sort(
              (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
            );
            this.featured.set(sorted.slice(0, 6));
          }
          this.loading.set(false);
        },
        error: () => {
          this.errorMessage.set('Impossibile caricare gli annunci.');
          this.loading.set(false);
        }
      });
  }

  resetFilters(): void {
    this.form.reset({ keyword: '', categoryId: '', minPrice: '', maxPrice: '' });
    this.search();
  }
}
