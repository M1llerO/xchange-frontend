import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ExchangeService } from '../../../services/exchange';
import { ExchangeDto } from '../../../models/exchange.model';

@Component({
  selector: 'app-reviews-to-give',
  imports: [CommonModule, RouterLink],
  templateUrl: './reviews-to-give.html',
  styleUrl: './reviews-to-give.css'
})
export class ReviewsToGive implements OnInit {
  private exchangeService = inject(ExchangeService);

  private exchanges = signal<ExchangeDto[]>([]);
  loading = signal(true);
  errorMessage = signal<string | null>(null);

  completedExchanges = computed(() => this.exchanges().filter((e) => e.status === 'completato'));

  ngOnInit(): void {
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
}
