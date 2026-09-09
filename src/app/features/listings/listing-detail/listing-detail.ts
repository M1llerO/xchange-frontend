import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ListingService } from '../../../services/listing';
import { ItemService } from '../../../services/item';
import { CategoryService, Category } from '../../../services/category';
import { OfferService } from '../../../services/offer';
import { MessageService } from '../../../services/message';
import { UserService } from '../../../services/user';
import { AuthService } from '../../../services/auth';
import { ListingDetailDto } from '../../../models/listing.model';
import { ItemDto } from '../../../models/item.model';
import { UserProfileDto } from '../../../models/user.model';
import { extractErrorMessage } from '../../../core/api-error.util';
import { resolveAssetUrl } from '../../../core/asset-url.util';
import { CONDITION_LABELS } from '../../items/item.constants';

const STATUS_LABELS: Record<string, string> = {
  attivo: 'Attivo',
  in_trattativa: 'In trattativa',
  scambiato: 'Scambiato',
  eliminato: 'Rimosso'
};

@Component({
  selector: 'app-listing-detail',
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './listing-detail.html',
  styleUrl: './listing-detail.css'
})
export class ListingDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private listingService = inject(ListingService);
  private itemService = inject(ItemService);
  private categoryService = inject(CategoryService);
  private offerService = inject(OfferService);
  private messageService = inject(MessageService);
  private userService = inject(UserService);
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);

  readonly conditionLabels = CONDITION_LABELS;
  readonly statusLabels = STATUS_LABELS;

  listing = signal<ListingDetailDto | null>(null);
  owner = signal<UserProfileDto | null>(null);
  categories = signal<Category[]>([]);
  myItems = signal<ItemDto[]>([]);
  selectedItemIds = signal<number[]>([]);

  loading = signal(true);
  errorMessage = signal<string | null>(null);

  offerSubmitting = signal(false);
  offerSuccess = signal(false);
  offerError = signal<string | null>(null);
  createdOfferId = signal<number | null>(null);
  chatMessageFailed = signal(false);

  offerForm = this.fb.nonNullable.group({
    message: ['']
  });

  isLoggedIn = computed(() => this.authService.isLoggedIn());
  isOwner = computed(() => {
    const listing = this.listing();
    const userId = this.authService.getUserId();
    return !!listing && listing.ownerId === userId;
  });
  canMakeOffer = computed(
    () => this.isLoggedIn() && !this.isOwner() && this.listing()?.status === 'attivo'
  );
  acceptedCategoryNames = computed(() => {
    const listing = this.listing();
    if (!listing) return [];
    const byId = new Map(this.categories().map((c) => [c.id, c.name]));
    return listing.acceptedCategoryIds.map((id) => byId.get(id) ?? `#${id}`);
  });

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const id = Number(params.get('id'));
      if (Number.isFinite(id)) {
        this.load(id);
      }
    });
  }

  private load(id: number): void {
    this.loading.set(true);
    this.errorMessage.set(null);
    this.listing.set(null);
    this.owner.set(null);
    this.offerSuccess.set(false);
    this.offerError.set(null);
    this.createdOfferId.set(null);
    this.chatMessageFailed.set(false);
    this.selectedItemIds.set([]);

    this.categoryService.getAll().subscribe({
      next: (categories) => this.categories.set(categories),
      error: () => {}
    });

    this.listingService.getById(id).subscribe({
      next: (listing) => {
        this.listing.set(listing);
        this.loading.set(false);

        this.userService.getProfile(listing.ownerId).subscribe({
          next: (profile) => this.owner.set(profile),
          error: () => {}
        });

        if (this.canMakeOffer()) {
          this.loadMyItems();
        }
      },
      error: (err) => {
        this.errorMessage.set(extractErrorMessage(err, "Impossibile caricare l'annuncio."));
        this.loading.set(false);
      }
    });
  }

  private loadMyItems(): void {
    this.itemService.getAll().subscribe({
      next: (items) => this.myItems.set(items.filter((i) => !i.archived)),
      error: () => {}
    });
  }

  imageUrl(url: string | null | undefined): string {
    return resolveAssetUrl(url);
  }

  toggleSelectedItem(itemId: number): void {
    this.selectedItemIds.update((ids) =>
      ids.includes(itemId) ? ids.filter((id) => id !== itemId) : [...ids, itemId]
    );
  }

  isSelected(itemId: number): boolean {
    return this.selectedItemIds().includes(itemId);
  }

  submitOffer(): void {
    const listing = this.listing();
    const itemIds = this.selectedItemIds();
    if (!listing || itemIds.length === 0) {
      this.offerError.set('Seleziona almeno un oggetto da proporre in cambio.');
      return;
    }

    this.offerSubmitting.set(true);
    this.offerError.set(null);
    this.chatMessageFailed.set(false);

    const message = this.offerForm.getRawValue().message || null;

    this.offerService
      .makeOffer(listing.id, { itemIds, message })
      .subscribe({
        next: (offer) => {
          this.messageService
            .send(offer.offerId, { body: message ?? 'Ho inviato una proposta di scambio per questo annuncio.' })
            .subscribe({ error: () => this.chatMessageFailed.set(true) });

          this.offerSubmitting.set(false);
          this.offerSuccess.set(true);
          this.createdOfferId.set(offer.offerId);
          this.selectedItemIds.set([]);
          this.offerForm.reset({ message: '' });
        },
        error: (err) => {
          this.offerSubmitting.set(false);
          this.offerError.set(extractErrorMessage(err, "Impossibile inviare l'offerta."));
        }
      });
  }
}
