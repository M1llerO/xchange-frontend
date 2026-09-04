import { Routes } from '@angular/router';
import { LayoutComponent } from './features/layout/layout.component';
import { LoginComponent } from './features/auth/login.component';
import { RegisterComponent } from './features/auth/register.component';
import { authGuard } from './guards/auth-guard';
import { roleGuard } from './guards/role-guard';

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: 'login', component: LoginComponent },
      { path: 'register', component: RegisterComponent },

      // Protected routes (require login)
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
        canActivate: [authGuard]
      },
      {
        path: 'listings',
        loadComponent: () => import('./features/listings/listings.component').then(m => m.ListingsComponent)
      },
      {
        path: 'items',
        loadComponent: () => import('./features/items/items.component').then(m => m.ItemsComponent),
        canActivate: [authGuard]
      },
      {
        path: 'offers',
        loadComponent: () => import('./features/offers/offers.component').then(m => m.OffersComponent),
        canActivate: [authGuard]
      },
      {
        path: 'messages',
        loadComponent: () => import('./features/messages/message-inbox/message-inbox').then(m => m.MessageInbox),
        canActivate: [authGuard]
      },
      {
        path: 'messages/:offerId',
        loadComponent: () => import('./features/messages/message-thread/message-thread').then(m => m.MessageThread),
        canActivate: [authGuard]
      },
      {
        path: 'reviews',
        loadComponent: () => import('./features/reviews/reviews-to-give/reviews-to-give').then(m => m.ReviewsToGive),
        canActivate: [authGuard]
      },
      {
        path: 'reviews/new/:exchangeId',
        loadComponent: () => import('./features/reviews/review-form/review-form').then(m => m.ReviewForm),
        canActivate: [authGuard]
      },
      {
        path: 'profile',
        loadComponent: () => import('./features/profile/profile.component').then(m => m.ProfileComponent),
        canActivate: [authGuard]
      },
      {
        path: 'settings',
        loadComponent: () => import('./features/settings/settings.component').then(m => m.SettingsComponent),
        canActivate: [authGuard]
      },

      // Admin routes (require ADMIN role)
      {
        path: 'admin',
        canActivate: [roleGuard('ADMIN')],
        children: [
          {
            path: 'reports',
            loadComponent: () => import('./features/admin/reports/reports.component').then(m => m.ReportsComponent)
          },
          {
            path: 'categories',
            loadComponent: () => import('./features/admin/categories/categories.component').then(m => m.CategoriesComponent)
          }
        ]
      },

      { path: 'forbidden', loadComponent: () => import('./features/forbidden/forbidden.component').then(m => m.ForbiddenComponent) },
      { path: '', redirectTo: 'listings', pathMatch: 'full' }
    ]
  }
];
