# M2POS Angular 20 — Fases de Migración

## FASE 1 — Template + Config + Auth ✅ COMPLETADA

### Entregables completados
- [x] Scaffold Angular 20 standalone (sin NgModules)
- [x] `tsconfig.json` + `tsconfig.app.json` + `tsconfig.spec.json`
- [x] `angular.json` con configuración multi-entorno
- [x] `package.json` con dependencias modernas (TypeScript 5.8, Angular 20)
- [x] `ngsw-config.json` (Service Worker)
- [x] `src/index.html` con `data-theme="dark-gold"` por defecto
- [x] `src/main.ts` bootstrap standalone
- [x] `app.component.ts` raíz
- [x] `app.config.ts` (reemplaza AppModule, sin NgModules)
- [x] `app.routes.ts` con lazy loading para ~35 módulos

### Environments
- [x] `environment.interface.ts` — tipado único para todos los entornos
- [x] `environment.ts` (DEV) — todas las URLs comentadas organizadas
- [x] `environment.staging.ts`
- [x] `environment.prod.ts` — URLs de producción Mobile y Cavallaro preservadas
- [x] `APP_CONFIG` injection token — nunca importar environment directo en servicios

### Sistema de temas
- [x] `assets/themes/themes.css` — 9 paletas CSS variables
  - Light, Light Teal, Light Slate
  - Dark Blue, Dark Gold (default), Dark Teal, Dark Purple, Dark Red, Graphite
- [x] `ThemeService` con signals Angular 20
- [x] FAB flotante + panel lateral deslizante

### Layout
- [x] `AppShellComponent` — grid responsivo con CSS puro
- [x] `HeaderComponent` — toggle sidebar, usuario, avatar, logout
- [x] `SidebarComponent` — acordeón, colapso, íconos SVG inline, mobile
- [x] `BreadcrumbComponent` — automático desde router
- [x] `NotFoundComponent` — 404

### Auth
- [x] `LoginComponent` — signals, show/hide password, recuérdame
- [x] `LoginService` — JWT decode, refresh token, signals + getters planos
- [x] `authGuard` (funcional) — reemplaza clase CanActivate
- [x] `canMatchGuard` (funcional) — reemplaza CanLoad
- [x] `loginGuard` (funcional) — redirige si ya autenticado
- [x] `tokenExpiryGuard` (funcional) — renueva token proactivo
- [x] `AuthInterceptor` (funcional) — Bearer token + 401 handler
- [x] `SidebarService` — signals para estado collapse/mobile

### Páginas placeholder
- [x] 33 módulos con componente + routes file listos para migrar:
  - dashboard, ventas, pedidos, reparto, clientes, productos, stock
  - compras, transferencia, canje, usuarios, empresas, vendedores
  - premios, puntos, stock-premio, historial-premios, historial-puntos
  - cupones, alianzas
  - parametros/: categoria, unidad-medida, lista-precio, precios, descuentos,
    medio-pago, comprobantes, sucursales, terminales, depositos,
    motivo-anulacion, motivo-transferencia, proveedores, bancos

---

## FASE 2 — Modelos + Servicios ✅ COMPLETADA

### Modelos de dominio (`src/app/core/models/domain/`)
- [x] 65 interfaces TypeScript (migradas de class a interface)
- [x] Barrel `index.ts` con re-export de todos
- [x] Modelos simples (sin dependencias): Authorities, Rol, TipoNegocio,
  TipoPrecio, FormaPago, FormaVenta, GrupoDescuento, GrupoMaterial,
  CategoriaProducto, UnidadMedida, ListaPrecio, MedioPago, TipoMedioPago,
  Bancos, Canal, Sucursal, TipoDeposito, Terminales, MotivoAnulacion,
  MotivoAnulacionCompra, MotivoTransferencia, Chofer, Vehiculo, ClienteGoogle,
  ResumenSucursal, ResumenUsuario, ResumenMedioPago+ResumenCanal, TopClientes,
  TopProductos, StockReport, Orden, Influencer, Alianza, ErrModel,
  ObjetoSelector, Datos, TotalModel
- [x] Modelos con dependencias: Empresas, Producto, Deposito, Usuarios, Vendedor,
  Cliente, Proveedor, CobranzaDetalle, Cobranza, CobranzaResumen, Cabecera,
  Detalles, Comprobantes, Credito+EstadoCredito, Cupon, DescuentoCupon,
  InfluencerDescuento, Seguidor, Descuento, Bonificacion, Precio,
  Material, PrecioMaterial, Stock, Premio, StockPremio, StockPremioDet,
  StockPremioCab, HistorialPremio, HistorialPunto, Punto, PedidoDescuento,
  VentaDescuento, CompraDetalle, TransferenciaDetalle, RepartoDetalle,
  PedidoDetalle, VentaDetalle
- [x] Modelos circulares resueltos: Pedido, Venta, Reparto, Canje+CanjeDet,
  Compra, Transferencia, RepartoDocs+Marcador
- [x] Modelos ABI: ABI_Imagenes, ABI_Producto, ABI_Pedido+ABI_ProductoPedido,
  ABI_PuntoRetiro, ABI_Vehiculo

### Servicios de dominio (`src/app/core/services/domain/`)
- [x] 48 servicios Angular 20 (inject(), no constructor DI)
- [x] Sin rxjs-compat, sin `.map()` legacy
- [x] Barrel `index.ts` con re-export de todos
- [x] Servicios CRUD estándar (getAll/getById/create/update/delete):
  BancosService, CategoriaService, ChoferService, ComprobantesService,
  DepositoService, DescuentoService, EmpresasService, FormaVentaService,
  GrupoDescuentoService, GrupoMaterialService, InfluencerService,
  ListaPrecioService, MedioPagoService, MotivoAnulacionService,
  MotivoAnulacionCompraService, MotivoTransferenciaService, PrecioService,
  PrecioMaterialService, PremioService, ProductoService, ProveedorService,
  PuntoService, RolService, SucursalService, TerminalesService,
  TipoDepositoService, TipoMedioPagoService, TipoPrecioService,
  UnidadMedidaService, UsuariosService, VehiculoService, VendedorService,
  AlianzasService, CuponService, BonificacionService, HistorialPremioService,
  HistorialPuntosService, StockPremioService
- [x] Servicios especializados (métodos extra):
  ClienteService (search, getByDoc), VentasService (dashboard: top/resumen),
  PedidosService (anular), RepartoService (anular), ComprasService (anular),
  TransferenciaService (anular), CobranzaService (resumenMedioPago),
  CreditosService, StockService (reporte), CanjeService (anular)

---

## FASE 3 — Componentes shared ✅ COMPLETADA

### Componentes a construir desde cero (plugins eliminados)
- [x] `SelectSearchComponent` — reemplaza `@ng-select/ng-select`
- [x] `ChartBarComponent` — reemplaza `ngx-charts` + `ng2-charts` (Chart.js)
- [x] `ChartPieComponent` — reemplaza `ngx-charts` pie
- [x] `ChartLineComponent` — reemplaza `ngx-charts` line
- [x] `MapaComponent` — reemplaza `@agm/core` (Leaflet)
- [x] `ToastService` — wrapper ngx-toastr v19
- [x] `ModalConfirmComponent` — reemplaza ng-bootstrap modal
- [x] `InputMaskDirective` — reemplaza `angular2-text-mask`
- [x] `DebounceInputDirective` — debounce nativo
- [x] `IncrementadorComponent` — ya existe, migrar
- [ ] `BreadcrumbComponent` — ✅ ya migrado (Fase 1)
- [x] Pipes: `SearchPipe`, `ImagenPipe`, `ImagenProductoPipe`

---

## FASE 4 — Migración de páginas (EN CURSO)

### Prioridad 1 — Core del negocio
- [x] Dashboard (charts + filtros fecha/sucursal)
- [ ] Nueva Venta (componente complejo)
- [ ] Lista de Ventas
- [ ] Nuevo Pedido
- [ ] Lista de Pedidos
- [ ] Reparto nuevo y lista

### Prioridad 2 — Parámetros
- [ ] 28 páginas de parámetros (formularios CRUD)
- [ ] Sucursales, Terminales, Comprobantes, Medio Pago
- [ ] Productos, Categorías, Precios, Descuentos

### Prioridad 3 — Valoraciones
- [ ] Canjes, Premios, Puntos
- [ ] Stock Premio, Historial

### Prioridad 4 — Tickets / Impresión
- [ ] Ticket 58mm, Ticket 80mm, V-Ticket
- [ ] Migrar jquery.PrintArea → window.print() nativo

### Prioridad 5 — ABI Integration
- [ ] Páginas ABI Productos, Precios, Stock, Punto Retiro

---

## FASE 5 — Optimización final (PENDIENTE)

- [ ] Service Worker / PWA verificación
- [ ] Bundle analysis (`npm run analyze`)
- [ ] OnPush en todos los componentes
- [ ] Lazy loading verificado con Chrome DevTools
- [ ] Tests unitarios básicos (Guards, LoginService)
- [ ] Browserlist / targets producción
- [ ] README final con instrucciones de deploy
