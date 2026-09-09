import { Component, EventEmitter, Input, OnInit, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OfferService } from '../../../services/offer';
import { ItemService } from '../../../services/item';
import { ItemDto } from '../../../models/item.model';
import { OfferDto } from '../../../models/offer.model';
import { extractErrorMessage } from '../../../core/api-error.util';

@Component({
  selector: 'app-counter-offer-modal',
  imports: [CommonModule, FormsModule],
  templateUrl: './counter-offer-modal.html',
  styleUrl: './counter-offer-modal.css'
})
export class CounterOfferModal implements OnInit {
  @Input({ required: true }) offerId!: number;
  @Output() closed = new EventEmitter<void>();
  @Output() submitted = new EventEmitter<OfferDto>();

  private offerService = inject(OfferService);
  private itemService = inject(ItemService);

  myItems = signal<ItemDto[]>([]);
  selectedItemIds = signal<Set<number>>(new Set());
  message = signal('');
  loading = signal(true);
  submitting = signal(false);
  errorMessage = signal<string | null>(null);

  ngOnInit(): void {
    this.itemService.getAll({ includeArchived: false }).subscribe({
      next: (items) => {
        this.myItems.set(items);
        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set('Impossibile caricare i tuoi oggetti.');
        this.loading.set(false);
      }
    });
  }

  toggleItem(itemId: number): void {
    const current = new Set(this.selectedItemIds());
    if (current.has(itemId)) {
      current.delete(itemId);
    } else {
      current.add(itemId);
    }
    this.selectedItemIds.set(current);
  }

  isSelected(itemId: number): boolean {
    return this.selectedItemIds().has(itemId);
  }

  submit(): void {
    if (this.selectedItemIds().size === 0) {
      this.errorMessage.set('Seleziona almeno un oggetto da proporre.');
      return;
    }

    this.submitting.set(true);
    this.errorMessage.set(null);

    this.offerService.counter(this.offerId, {
      itemIds: Array.from(this.selectedItemIds()),
      message: this.message().trim() || null
    }).subscribe({
      next: (offer) => {
        this.submitting.set(false);
        this.submitted.emit(offer);
      },
      error: (err) => {
        this.submitting.set(false);
        this.errorMessage.set(extractErrorMessage(err, 'Impossibile inviare la controproposta.'));
      }
    });
  }

  close(): void {
    this.closed.emit();
  }
}