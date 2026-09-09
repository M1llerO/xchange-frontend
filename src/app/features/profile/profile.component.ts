import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { UserService } from '../../services/user';
import { AuthService } from '../../services/auth';
import { UserProfileDto } from '../../models/user.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private userService = inject(UserService);
  private authService = inject(AuthService);

  profile = signal<UserProfileDto | null>(null);
  loading = signal(true);
  errorMessage = signal<string | null>(null);
  isOwnProfile = signal(true);

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const paramId = params.get('id');
      const currentUserId = this.authService.getUserId();
      const userId = paramId ? Number(paramId) : currentUserId;

      this.profile.set(null);
      this.errorMessage.set(null);
      this.loading.set(true);

      if (userId === null) {
        this.errorMessage.set('Utente non identificato.');
        this.loading.set(false);
        return;
      }

      this.isOwnProfile.set(userId === currentUserId);

      this.userService.getProfile(userId).subscribe({
        next: (profile) => {
          this.profile.set(profile);
          this.loading.set(false);
        },
        error: () => {
          this.errorMessage.set('Impossibile caricare il profilo.');
          this.loading.set(false);
        }
      });
    });
  }
}
