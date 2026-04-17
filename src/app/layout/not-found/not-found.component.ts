import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:60vh;gap:1rem;text-align:center;padding:2rem">
      <div style="font-size:5rem;font-weight:700;color:var(--border-color)">404</div>
      <h1 style="font-size:1.25rem;font-weight:600;color:var(--text-primary)">Página no encontrada</h1>
      <p style="color:var(--text-muted);max-width:320px">La ruta que buscás no existe o fue movida.</p>
      <a routerLink="/dashboard" class="btn btn-primary" style="margin-top:.5rem">
        Ir al Dashboard
      </a>
    </div>
  `,
})
export class NotFoundComponent {}
