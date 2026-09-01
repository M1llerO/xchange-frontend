import { Routes } from '@angular/router';
import { authGuard } from './guards/auth-guard';

export const routes: Routes = [
  {
    path: 'messages',
    loadComponent: () => import('./features/messages/message-inbox/message-inbox').then((m) => m.MessageInbox),
    canActivate: [authGuard]
  },
  {
    path: 'messages/:offerId',
    loadComponent: () => import('./features/messages/message-thread/message-thread').then((m) => m.MessageThread),
    canActivate: [authGuard]
  },
  {
    path: 'reviews',
    loadComponent: () => import('./features/reviews/reviews-to-give/reviews-to-give').then((m) => m.ReviewsToGive),
    canActivate: [authGuard]
  },
  {
    path: 'reviews/new/:exchangeId',
    loadComponent: () => import('./features/reviews/review-form/review-form').then((m) => m.ReviewForm),
    canActivate: [authGuard]
  }
];
