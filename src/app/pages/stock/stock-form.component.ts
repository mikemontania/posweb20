import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
@Component({ selector: 'app-stock-form', standalone: true, imports: [RouterModule],
  template: '<div class="page-content"><a routerLink="/stock" class="btn btn-secondary">Volver</a></div>' })
export class StockForm {}