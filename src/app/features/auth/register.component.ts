import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  form: FormGroup;
  loading = signal(false);
  errorMessage = signal('');

  constructor() {
    this.form = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, this.passwordStrengthValidator]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  private passwordStrengthValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.value;
    if (!password) return null;

    const hasMinLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

    const isStrong = hasMinLength && hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar;

    return isStrong ? null : { strongPassword: true };
  }

  private passwordMatchValidator(form: AbstractControl): ValidationErrors | null {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;

    if (!password || !confirmPassword) return null;

    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  hasMinLength(): boolean {
    return (this.form.get('password')?.value || '').length >= 8;
  }

  hasUpperCase(): boolean {
    return /[A-Z]/.test(this.form.get('password')?.value || '');
  }

  hasLowerCase(): boolean {
    return /[a-z]/.test(this.form.get('password')?.value || '');
  }

  hasNumber(): boolean {
    return /[0-9]/.test(this.form.get('password')?.value || '');
  }

  hasSpecialChar(): boolean {
    return /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(this.form.get('password')?.value || '');
  }

  getPasswordStrengthText(): string {
    const password = this.form.get('password')?.value || '';
    if (!password) return '';

    let strength = 0;
    if (this.hasMinLength()) strength++;
    if (this.hasUpperCase()) strength++;
    if (this.hasLowerCase()) strength++;
    if (this.hasNumber()) strength++;
    if (this.hasSpecialChar()) strength++;

    if (strength < 2) return 'Weak';
    if (strength < 4) return 'Fair';
    if (strength < 5) return 'Good';
    return 'Strong';
  }

  getPasswordStrengthClass(): string {
    const strength = this.getPasswordStrengthText();
    switch (strength) {
      case 'Weak': return 'strength-weak';
      case 'Fair': return 'strength-fair';
      case 'Good': return 'strength-good';
      case 'Strong': return 'strength-strong';
      default: return '';
    }
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    this.loading.set(true);
    this.errorMessage.set('');

    const { username, email, password } = this.form.value;
    this.authService.register({
      username,
      email,
      password,
      roles: ['USER']
    }).subscribe({
      next: () => {
        this.router.navigate(['/login'], {
          queryParams: { message: 'Registration successful. Please login.' }
        });
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(err.error?.message || 'Registration failed. Please try again.');
      }
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.form.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }
}
