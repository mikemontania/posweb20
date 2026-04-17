import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl:    './login.component.css',
})
export class LoginComponent {
  private readonly authSvc = inject(AuthService);
  private readonly router  = inject(Router);

  username = signal(localStorage.getItem('username') ?? '');
  password = signal('');
  remember = signal(!!localStorage.getItem('username'));
  showPass = signal(false);
  loading  = signal(false);

  toggleShowPass(): void {
    this.showPass.set(!this.showPass());
  }

  onSubmit(): void {
    if (!this.username() || !this.password()) return;
    this.loading.set(true);

    this.authSvc.login(this.username(), this.password(), this.remember()).subscribe({
      next: () => this.router.navigateByUrl('/dashboard'),
      error: (err: any) => {
        this.loading.set(false);
        if (err?.status === 401) {
          Swal.fire('Atención', 'Usuario o contraseña no válida', 'error');
        } else {
          Swal.fire('Error', 'No se pudo conectar con el servidor', 'error');
        }
      },
    });
  }
}
