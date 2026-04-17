# M2POS — Checklist de verificación

Usar este archivo para marcar ✅ lo que está funcionando en el proyecto real.
Marcar ❌ si algo falla y anotar el error.

---

## Fase 1 — Verificación de compilación

### Build base
- [ ] `npm install` sin errores
- [ ] `ng serve` levanta sin errores de compilación
- [ ] `ng build` produce bundle sin errores

### Archivos raíz (verificar que existen)
- [ ] `angular.json`
- [ ] `package.json` (TypeScript ~5.8)
- [ ] `tsconfig.json` (con `"baseUrl": "./"`)
- [ ] `tsconfig.app.json`
- [ ] `tsconfig.spec.json`
- [ ] `ngsw-config.json`
- [ ] `src/index.html`
- [ ] `src/main.ts`
- [ ] `src/styles.css`
- [ ] `src/assets/themes/themes.css`

### Environments
- [ ] `src/environments/environment.interface.ts`
- [ ] `src/environments/environment.ts`
- [ ] `src/environments/environment.staging.ts`
- [ ] `src/environments/environment.prod.ts`

### Auth
- [ ] Login renderiza correctamente en `http://localhost:4200/login`
- [ ] Login con credenciales válidas redirige a `/dashboard`
- [ ] Login con credenciales inválidas muestra SweetAlert2
- [ ] Show/hide password funciona
- [ ] Recuérdame guarda el usuario en localStorage
- [ ] Logout borra token y redirige a `/login`
- [ ] Ruta `/dashboard` sin token redirige a `/login`
- [ ] Token expirado redirige a `/login`

### Layout
- [ ] Sidebar muestra todos los ítems del menú
- [ ] Acordeón del sidebar funciona (expand/collapse)
- [ ] Sidebar colapsa en desktop (botón hamburger)
- [ ] Sidebar funciona como drawer en mobile (< 768px)
- [ ] Overlay cierra el sidebar en mobile
- [ ] FAB de temas abre panel lateral
- [ ] Todos los temas aplican correctamente (verificar al menos 3)
- [ ] Tema se persiste al recargar página
- [ ] Breadcrumb actualiza al navegar
- [ ] Avatar muestra iniciales del usuario
- [ ] Nombre de usuario visible en header

---

## Fase 2 — Verificación de modelos y servicios

### Modelos
- [ ] `src/app/core/models/domain/index.ts` exporta sin errores de TS
- [ ] Importar un modelo en un componente compila: `import { Venta } from '@core/models/domain'`

### Servicios (verificar inyección)
- [ ] `VentasService` se inyecta sin error
- [ ] `ClienteService` se inyecta sin error
- [ ] `ProductoService` se inyecta sin error
- [ ] `LoginService` retorna `isLoggedIn()` correctamente

---

## Fase 3 — Pendiente

- [ ] `SelectSearchComponent` construido y funcional
- [ ] `ChartBarComponent` renderiza con Chart.js
- [ ] `ChartPieComponent` renderiza con Chart.js
- [ ] `MapaComponent` renderiza con Leaflet
- [ ] Todos los pipes migrados

---

## Fase 4 — Pendiente

- [ ] Dashboard carga charts y datos reales
- [ ] Nueva Venta flujo completo funciona
- [ ] Todos los formularios CRUD de parámetros funcionan

---

## Fase 5 — Pendiente

- [ ] Bundle < 1MB inicial
- [ ] Lighthouse Performance > 80
- [ ] PWA instalable

---

## Notas de errores encontrados

```
// Anotar aquí cualquier error con fecha y solución aplicada

// Ejemplo:
// 2026-04-06 — npm install fallaba por TypeScript 5.5 → corregido a ~5.8.0
// 2026-04-06 — ngsw-config.json faltaba → agregado en raíz del proyecto
// 2026-04-06 — arrow function en template HTML → reemplazado por método toggleShowPass()
```
