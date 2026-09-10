import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ExchangeService } from '../../../services/exchange';
import { AuthService } from '../../../services/auth';
import { extractErrorMessage } from '../../../core/api-error.util';
import { ExchangeDto, ExchangeMethod } from '../../../models/exchange.model';

export const EXCHANGE_METHOD_LABELS: Record<ExchangeMethod, string> = {
  di_persona: 'Di persona',
  spedizione: 'Spedizione'
};

@Component({
  selector: 'app-my-exchanges',
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './my-exchanges.html',
  styleUrl: './my-exchanges.css'
})
export class MyExchanges implements OnInit {
  private exchangeService = inject(ExchangeService);
  private authService = inject(AuthService);

  readonly methodLabels = EXCHANGE_METHOD_LABELS;
  readonly methodOptions: ExchangeMethod[] = ['di_persona', 'spedizione'];

  exchanges = signal<ExchangeDto[]>([]);
  loading = signal(true);
  errorMessage = signal<string | null>(null);
  actingId = signal<number | null>(null);

  editingLogisticsId = signal<number | null>(null);
  draftLocation = signal('');
  draftMethod = signal<ExchangeMethod | ''>('');

  currentUserId = this.authService.getUserId();

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.exchangeService.getMine().subscribe({
      next: (exchanges) => {
        this.exchanges.set(exchanges);
        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set('Impossibile caricare gli scambi.');
        this.loading.set(false);
      }
    });
  }

  counterpartId(exchange: ExchangeDto): number {
    return exchange.ownerId === this.currentUserId ? exchange.offererId : exchange.ownerId;
  }

  hasConfirmed(exchange: ExchangeDto): boolean {
    return exchange.ownerId === this.currentUserId
      ? exchange.ownerConfirmedAt !== null
      : exchange.offererConfirmedAt !== null;
  }

  confirm(exchange: ExchangeDto): void {
    this.act(exchange.id, () =>
      this.exchangeService.confirm(exchange.id).subscribe({
        next: (updated) => this.replace(updated),
        error: (err) => {
          this.errorMessage.set(extractErrorMessage(err, 'Impossibile confermare lo scambio.'));
          this.actingId.set(null);
        }
      })
    );
  }

  cancel(exchange: ExchangeDto): void {
    this.act(exchange.id, () =>
      this.exchangeService.cancel(exchange.id).subscribe({
        next: (updated) => this.replace(updated),
        error: (err) => {
          this.errorMessage.set(extractErrorMessage(err, 'Impossibile annullare lo scambio.'));
          this.actingId.set(null);
        }
      })
    );
  }

  startEditLogistics(exchange: ExchangeDto): void {
    this.errorMessage.set(null);
    this.editingLogisticsId.set(exchange.id);
    this.draftLocation.set(exchange.location ?? '');
    this.draftMethod.set(exchange.method ?? '');
  }

  cancelEditLogistics(): void {
    this.editingLogisticsId.set(null);
  }

  saveLogistics(exchange: ExchangeDto): void {
    const location = this.draftLocation().trim();
    const method = this.draftMethod();

    if (!location && !method) {
      this.errorMessage.set('Indica almeno il luogo o il metodo di scambio.');
      return;
    }

    this.act(exchange.id, () =>
      this.exchangeService
        .updateLogistics(exchange.id, {
          ...(location ? { location } : {}),
          ...(method ? { method } : {})
        })
        .subscribe({
          next: (updated) => {
            this.replace(updated);
            this.editingLogisticsId.set(null);
          },
          error: (err) => {
            this.errorMessage.set(extractErrorMessage(err, 'Impossibile salvare i dettagli dello scambio.'));
            this.actingId.set(null);
          }
        })
    );
  }

  private act(id: number, action: () => void): void {
    this.actingId.set(id);
    this.errorMessage.set(null);
    action();
  }

  private replace(updated: ExchangeDto): void {
    this.exchanges.update((list) => list.map((e) => (e.id === updated.id ? updated : e)));
    this.actingId.set(null);
  }
}
