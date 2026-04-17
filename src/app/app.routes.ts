import { Routes } from '@angular/router';
import { authGuard, loginGuard, tokenExpiryGuard, canMatchGuard } from './core/guards/auth.guard';
import { pedidosRoutes } from './pages/pedidos/pedidos.routes';

export const routes: Routes = [
  { path: 'login', canActivate: [loginGuard],
    loadComponent: () => import('./auth/login/login.component').then(m => m.LoginComponent) },

  { path: '',
    loadComponent: () => import('./layout/shell/shell.component').then(m => m.AppShellComponent),
    canActivate: [authGuard], canMatch: [canMatchGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', canActivate: [tokenExpiryGuard], title: 'Dashboard — M2POS',
        loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent) },

      // Parámetros (en /pages/parametros/)
      { path: 'bancos',              canActivate: [tokenExpiryGuard], loadChildren: () => import('./pages/parametros/bancos/bancos.routes').then(m => m.bancosRoutes) },
      { path: 'categoria',           canActivate: [tokenExpiryGuard], loadChildren: () => import('./pages/parametros/categoria/categoria.routes').then(m => m.categoriaRoutes) },
      { path: 'comprobantes',        canActivate: [tokenExpiryGuard], loadChildren: () => import('./pages/parametros/comprobantes/comprobantes.routes').then(m => m.comprobantesRoutes) },
      { path: 'depositos',           canActivate: [tokenExpiryGuard], loadChildren: () => import('./pages/parametros/depositos/depositos.routes').then(m => m.depositosRoutes) },
      { path: 'forma-venta',         canActivate: [tokenExpiryGuard], loadChildren: () => import('./pages/parametros/forma-venta/forma-venta.routes').then(m => m.forma_ventaRoutes) },
      { path: 'grupo-descuento',     canActivate: [tokenExpiryGuard], loadChildren: () => import('./pages/parametros/grupo-descuento/grupo-descuento.routes').then(m => m.grupo_descuentoRoutes) },
      { path: 'grupo-material',      canActivate: [tokenExpiryGuard], loadChildren: () => import('./pages/parametros/grupo-material/grupo-material.routes').then(m => m.grupo_materialRoutes) },
      { path: 'lista-precio',        canActivate: [tokenExpiryGuard], loadChildren: () => import('./pages/parametros/lista-precio/lista-precio.routes').then(m => m.lista_precioRoutes) },
      { path: 'medio-pago',          canActivate: [tokenExpiryGuard], loadChildren: () => import('./pages/parametros/medio-pago/medio-pago.routes').then(m => m.medio_pagoRoutes) },
      { path: 'motivo-anulacion',    canActivate: [tokenExpiryGuard], loadChildren: () => import('./pages/parametros/motivo-anulacion/motivo-anulacion.routes').then(m => m.motivo_anulacionRoutes) },
      { path: 'motivo-anulacion-compra', canActivate: [tokenExpiryGuard], loadChildren: () => import('./pages/parametros/motivo-anulacion-compra/motivo-anulacion-compra.routes').then(m => m.motivo_anulacion_compraRoutes) },
      { path: 'motivo-transferencia', canActivate: [tokenExpiryGuard], loadChildren: () => import('./pages/parametros/motivo-transferencia/motivo-transferencia.routes').then(m => m.motivo_transferenciaRoutes) },
      { path: 'sucursales',          canActivate: [tokenExpiryGuard], loadChildren: () => import('./pages/parametros/sucursales/sucursales.routes').then(m => m.sucursalesRoutes) },
      { path: 'terminales',          canActivate: [tokenExpiryGuard], loadChildren: () => import('./pages/parametros/terminales/terminales.routes').then(m => m.terminalesRoutes) },
      { path: 'tipo-deposito',       canActivate: [tokenExpiryGuard], loadChildren: () => import('./pages/parametros/tipo-deposito/tipo-deposito.routes').then(m => m.tipo_depositoRoutes) },
      { path: 'tipo-medio-pago',     canActivate: [tokenExpiryGuard], loadChildren: () => import('./pages/parametros/tipo-medio-pago/tipo-medio-pago.routes').then(m => m.tipo_medio_pagoRoutes) },
      { path: 'unidad-medida',       canActivate: [tokenExpiryGuard], loadChildren: () => import('./pages/parametros/unidad-medida/unidad-medida.routes').then(m => m.unidad_medidaRoutes) },

      // Módulos principales (en /pages/)
      { path: 'alianzas',            canActivate: [tokenExpiryGuard], loadChildren: () => import('./pages/alianzas/alianzas.routes').then(m => m.alianzasRoutes) },
      { path: 'bonificaciones',      canActivate: [tokenExpiryGuard], loadChildren: () => import('./pages/bonificaciones/bonificaciones.routes').then(m => m.bonificacionesRoutes) },
      { path: 'categoria',            canActivate: [tokenExpiryGuard], loadChildren: () => import('./pages/parametros/categoria/categoria.routes').then(m => m.categoriaRoutes) },
      { path: 'choferes',            canActivate: [tokenExpiryGuard], loadChildren: () => import('./pages/choferes/choferes.routes').then(m => m.choferesRoutes) },
      { path: 'clientes',            canActivate: [tokenExpiryGuard], loadChildren: () => import('./pages/clientes/clientes.routes').then(m => m.clientesRoutes) },
      { path: 'descuentos',          canActivate: [tokenExpiryGuard], loadChildren: () => import('./pages/descuentos/descuentos.routes').then(m => m.descuentosRoutes) },
      { path: 'precios',             canActivate: [tokenExpiryGuard], loadChildren: () => import('./pages/precios/precios.routes').then(m => m.preciosRoutes) },
      { path: 'precios-materiales',  canActivate: [tokenExpiryGuard], loadChildren: () => import('./pages/precios-materiales/precios-materiales.routes').then(m => m.precios_materialesRoutes) },
      { path: 'premios',             canActivate: [tokenExpiryGuard], loadChildren: () => import('./pages/premios/premios.routes').then(m => m.premiosRoutes) },
      { path: 'productos',           canActivate: [tokenExpiryGuard], loadChildren: () => import('./pages/productos/productos.routes').then(m => m.productosRoutes) },
      { path: 'proveedores',         canActivate: [tokenExpiryGuard], loadChildren: () => import('./pages/proveedores/proveedores.routes').then(m => m.proveedoresRoutes) },
      { path: 'puntos',              canActivate: [tokenExpiryGuard], loadChildren: () => import('./pages/puntos/puntos.routes').then(m => m.puntosRoutes) },
      { path: 'stock',               canActivate: [tokenExpiryGuard], loadChildren: () => import('./pages/stock/stock.routes').then(m => m.stockRoutes) },
      { path: 'usuarios',            canActivate: [tokenExpiryGuard], loadChildren: () => import('./pages/usuarios/usuarios.routes').then(m => m.usuariosRoutes) },
      { path: 'vehiculos',           canActivate: [tokenExpiryGuard], loadChildren: () => import('./pages/vehiculos/vehiculos.routes').then(m => m.vehiculosRoutes) },
      { path: 'vendedores',          canActivate: [tokenExpiryGuard], loadChildren: () => import('./pages/vendedores/vendedores.routes').then(m => m.vendedoresRoutes) },

      { path: 'ventas',              canActivate: [tokenExpiryGuard], loadChildren: () => import('./pages/ventas/ventas.routes').then(m => m.ventasRoutes) },
      { path: 'pedidos',             canActivate: [tokenExpiryGuard], loadChildren: () => import('./pages/pedidos/pedidos.routes').then(m => m.pedidosRoutes) },

      // Cobranzas y Tickets
      { path: 'cobranza-lista',      canActivate: [tokenExpiryGuard], loadChildren: () => import('./pages/cobranza-lista/cobranza-lista.routes').then(m => m.cobranzaListaRoutes) },
      { path: 'ticket-venta',        canActivate: [tokenExpiryGuard], loadChildren: () => import('./pages/ticket-venta/ticket-venta.routes').then(m => m.ticketVentaRoutes) },

      // Transacciones
      { path: 'ventas-lista',        canActivate: [tokenExpiryGuard], loadChildren: () => import('./pages/ventas-lista/ventas-lista.routes').then(m => m.ventasListaRoutes) },
      { path: 'pedidos-lista',       canActivate: [tokenExpiryGuard], loadChildren: () => import('./pages/pedidos-lista/pedidos-lista.routes').then(m => m.pedidosListaRoutes) },
      { path: 'canjes',               canActivate: [tokenExpiryGuard], loadChildren: () => import('./pages/canjes/canjes.routes').then(m => m.canjesRoutes) },
      { path: 'canjes-lista',        canActivate: [tokenExpiryGuard], loadChildren: () => import('./pages/canjes-lista/canjes-lista.routes').then(m => m.canjesListaRoutes) },
      { path: 'repartos',             canActivate: [tokenExpiryGuard], loadChildren: () => import('./pages/repartos/repartos.routes').then(m => m.repartosRoutes) },
      { path: 'reparto-lista',       canActivate: [tokenExpiryGuard], loadChildren: () => import('./pages/reparto-lista/reparto-lista.routes').then(m => m.repartoListaRoutes) },
      { path: 'reparto-docs',        canActivate: [tokenExpiryGuard], loadChildren: () => import('./pages/reparto-docs/reparto-docs.routes').then(m => m.repartoDocsRoutes) },
      { path: 'creditos-lista',      canActivate: [tokenExpiryGuard], loadChildren: () => import('./pages/creditos-lista/creditos-lista.routes').then(m => m.creditosListaRoutes) },

      // Nuevas páginas migradas
      { path: 'historial-puntos',    canActivate: [tokenExpiryGuard], loadChildren: () => import('./pages/historial-puntos/historial-puntos.routes').then(m => m.historialPuntosRoutes) },
      { path: 'historial-premios',   canActivate: [tokenExpiryGuard], loadChildren: () => import('./pages/historial-premios/historial-premios.routes').then(m => m.historialPremiosRoutes) },
      { path: 'cupones',             canActivate: [tokenExpiryGuard], loadChildren: () => import('./pages/cupones/cupones.routes').then(m => m.cuponesRoutes) },
      { path: 'influencers',         canActivate: [tokenExpiryGuard], loadChildren: () => import('./pages/influencers/influencers.routes').then(m => m.influencersRoutes) },
      { path: 'empresas',            canActivate: [tokenExpiryGuard], loadChildren: () => import('./pages/empresas/empresas.routes').then(m => m.empresasRoutes) },
      { path: 'reporte-vendedores',  canActivate: [tokenExpiryGuard], loadChildren: () => import('./pages/reporte-vendedores/reporte-vendedores.routes').then(m => m.reporteVendedoresRoutes) },
      { path: 'stock-premio',         canActivate: [tokenExpiryGuard], loadChildren: () => import('./pages/stock-premio/stock-premio.routes').then(m => m.stockPremioRoutes) },
      { path: 'mv-stock-premio',      canActivate: [tokenExpiryGuard], loadChildren: () => import('./pages/mv-stock-premio/mv-stock-premio.routes').then(m => m.mvStockPremioRoutes) },
      { path: 'mv-stock-premio-docs', canActivate: [tokenExpiryGuard], loadChildren: () => import('./pages/mv-stock-premio-docs/mv-stock-premio-docs.routes').then(m => m.mvStockPremioDocsRoutes) },

      // Compras
      { path: 'compras-lista',        canActivate: [tokenExpiryGuard], loadChildren: () => import('./pages/compras-lista/compras-lista.routes').then(m => m.comprasListaRoutes) },
      { path: 'compras-nueva',        canActivate: [tokenExpiryGuard], loadChildren: () => import('./pages/compras-nueva/compras-nueva.routes').then(m => m.comprasNuevaRoutes) },

      // Transferencias
      { path: 'transferencias-lista', canActivate: [tokenExpiryGuard], loadChildren: () => import('./pages/transferencias-lista/transferencias-lista.routes').then(m => m.transferenciasListaRoutes) },
      { path: 'transferencias-nueva', canActivate: [tokenExpiryGuard], loadChildren: () => import('./pages/transferencias-nueva/transferencias-nueva.routes').then(m => m.transferenciasNuevaRoutes) },
    ],
  },

  { path: '**', loadComponent: () => import('./layout/not-found/not-found.component').then(m => m.NotFoundComponent) },
];
