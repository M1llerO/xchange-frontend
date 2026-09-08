import { Routes } from '@angular/router';
import { LayoutComponent } from './features/layout/layout.component';
import { LoginComponent } from './features/auth/login.component';
import { RegisterComponent } from './features/auth/register.component';
import { roleGuard } from './guards/role-guard';
import { authGuard } from './guards/auth-guard';

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
        loadComponent: () => import('./features/listings/listing-search/listing-search').then(m => m.ListingSearch)
      },
      {
        path: 'listings/new',
        loadComponent: () => import('./features/listings/create-listing/create-listing').then(m => m.CreateListing),
        canActivate: [authGuard]
      },
      {
        path: 'listings/mine',
        loadComponent: () => import('./features/listings/my-listings/my-listings').then(m => m.MyListings),
        canActivate: [authGuard]
      },
      {
        path: 'listings/:id',
        loadComponent: () => import('./features/listings/listing-detail/listing-detail').then(m => m.ListingDetail)
      },
      {
        path: 'items',
        loadComponent: () => import('./features/items/item-list/item-list').then(m => m.ItemList),
        canActivate: [authGuard]
      },
      {
        path: 'items/new',
        loadComponent: () => import('./features/items/item-form/item-form').then(m => m.ItemForm),
        canActivate: [authGuard]
      },
      {
        path: 'items/:id/edit',
        loadComponent: () => import('./features/items/item-form/item-form').then(m => m.ItemForm),
        canActivate: [authGuard]
      },
      {
        path: 'items/:id/images',
        loadComponent: () => import('./features/items/item-images/item-images').then(m => m.ItemImages),
        canActivate: [authGuard]
      },
      {
        path: 'offers',
        loadComponent: () => import('./features/offers/my-offers/my-offers').then(m => m.MyOffers),
        canActivate: [authGuard]
      },
      {
        path: 'exchanges',
        loadComponent: () => import('./features/exchanges/my-exchanges/my-exchanges').then(m => m.MyExchanges),
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
        path: 'profile/:id',
        loadComponent: () => import('./features/profile/profile.component').then(m => m.ProfileComponent),
        canActivate: [authGuard]
      },
      {
        path: 'reports/new',
        loadComponent: () => import('./features/reports/report-form/report-form').then(m => m.ReportForm),
        canActivate: [authGuard]
      },
      {
        path: 'reports/mine',
        loadComponent: () => import('./features/reports/my-reports/my-reports').then(m => m.MyReports),
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
