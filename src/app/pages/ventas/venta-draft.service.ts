/**
 * VentaDraftService — Red de seguridad para ventas en curso
 * ──────────────────────────────────────────────────────────
 * Migrado de localStorage → IndexedDB (librería idb).
 *
 * Por qué IndexedDB:
 *   - Guarda objetos JS nativos SIN JSON.stringify → no hay referencias
 *     circulares (VentaDetalle.venta → Venta era el bug anterior)
 *   - ~50% del disco disponible vs ~5MB de localStorage
 *   - Asíncrono → no bloquea la UI
 *   - Transacciones ACID → seguro con múltiples pestañas
 *
 * Requiere: npm i idb
 *
 * Dos capas de protección:
 *
 *   DRAFT  (draft_{codTerminal})
 *     Snapshot del carrito en progreso, guardado en cada cambio.
 *     Expiración: 24 horas.
 *
 *   PENDING  (pending_{codTerminal})
 *     Estado completo guardado ANTES de enviar al servidor.
 *     Si la red falla → se restaura en pantalla para que el vendedor
 *     verifique y guarde manualmente (NO se reenvía automáticamente).
 */
import { Injectable, inject } from '@angular/core';
import { IDBPDatabase, openDB }  from 'idb';
import { AuthService }           from '../../core/services/auth.service';
import { fromEvent, map, filter, Observable } from 'rxjs';

const DB_NAME    = 'm2pos';
const DB_VERSION = 1;
const STORE_DRAFT   = 'drafts';
const STORE_PENDING = 'pending';

// ── Tipos ─────────────────────────────────────────────────────────────────────

/** Snapshot del carrito en progreso */
export interface VentaDraft {
  savedAt:      number;
  codTerminal:  number;
  detalles:     any[];          // VentaDetalle[] — objetos nativos sin circular refs
  descuentos:   any[];
  porcentajeDescuento: number;
  cliente:      any | null;
  canal:        any | null;
  modoEntrega:  string;
  listaPrecio:  any | null;
  formaVenta:   any | null;
  vendedor:     any | null;
  cuponPromo:   any | null;
  pedido:       any | null;
}

/** Payload + estado UI completo para restaurar después de un fallo */
export interface VentaPending {
  savedAt:     number;
  codTerminal: number;
  /** Payload exacto para cerrarVenta() */
  payload: { venta: any; descuentos: any[] };
  /**
   * Estado de la UI para restaurar en pantalla.
   * Contiene todos los campos necesarios para reconstruir
   * el estado de los signals y que el vendedor vea la venta
   * exactamente como estaba antes del fallo.
   */
  estadoUI: {
    detalles:            any[];
    descuentos:          any[];
    porcentajeDescuento: number;
    cliente:             any | null;
    canal:               any | null;
    modoEntrega:         string;
    listaPrecio:         any | null;
    formaVenta:          any | null;
    vendedor:            any | null;
    cuponPromo:          any | null;
    pedido:              any | null;
  };
}

// ── Servicio ──────────────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class VentaDraftService {

  private readonly auth = inject(AuthService);

  /** Promesa única de la DB — se abre una sola vez por sesión */
  private readonly _db: Promise<IDBPDatabase> = openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_DRAFT))   db.createObjectStore(STORE_DRAFT);
      if (!db.objectStoreNames.contains(STORE_PENDING)) db.createObjectStore(STORE_PENDING);
    },
  });

  // ── Claves dinámicas — aisladas por terminal ──────────────────────────────

  private get draftKey():   string { return `draft_${this.auth.terminal?.codTerminalVenta ?? 0}`; }
  private get pendingKey(): string { return `pending_${this.auth.terminal?.codTerminalVenta ?? 0}`; }
  private get codTerminal(): number { return this.auth.terminal?.codTerminalVenta ?? 0; }

  // ── CAPA 1: DRAFT (autosave del carrito) ──────────────────────────────────

  /**
   * Guarda el estado completo del carrito.
   * Se llama automáticamente desde el facade después de cada mutación.
   * Si detalles está vacío, elimina el draft.
   */
  async saveDraft(data: Omit<VentaDraft, 'savedAt' | 'codTerminal'>): Promise<void> {
    if (!this.codTerminal) return;
    if (!data.detalles?.length) { await this.clearDraft(); return; }

    try {
      const db = await this._db;
      await db.put(STORE_DRAFT, { savedAt: Date.now(), codTerminal: this.codTerminal, ...data }, this.draftKey);
      this.broadcastDraftChange();
    } catch {
      // Error al guardar draft en IDB — puede ocurrir en modo privado o si el storage está lleno
    }
  }

  /**
   * Lee el draft de la terminal activa.
   * Retorna null si no existe, no pertenece a esta terminal, o tiene >24hs.
   */
  async loadDraft(): Promise<VentaDraft | null> {
    try {
      const db    = await this._db;
      const draft = await db.get(STORE_DRAFT, this.draftKey) as VentaDraft | undefined;
      if (!draft || draft.codTerminal !== this.codTerminal) return null;
      if (Date.now() - draft.savedAt > 24 * 60 * 60 * 1000) { await this.clearDraft(); return null; }
      return draft;
    } catch { /* Error al leer draft de IDB — se devuelve null para no bloquear el flujo */ return null; }
  }

  async clearDraft(): Promise<void> {
    try { const db = await this._db; await db.delete(STORE_DRAFT, this.draftKey); }
    catch { /* Error al borrar draft de IDB — no es crítico, se sobrescribirá en el próximo ciclo */ }
  }

  // ── CAPA 2: PENDING (payload al momento de guardar) ───────────────────────

  /**
   * Guarda el payload completo + estado de la UI justo ANTES de cerrarVenta().
   * Si el servidor responde OK → clearPending().
   * Si falla → el pending queda para que el vendedor restaure manualmente.
   *
   * Por qué guardamos estadoUI además del payload:
   * El payload tiene la venta serializada para el servidor.
   * El estadoUI tiene los signals individuales (cliente, canal, formaVenta, etc.)
   * para poder reconstruir la pantalla exactamente como estaba.
   */
  async savePending(
    payload:  { venta: any; descuentos: any[] },
    estadoUI: VentaPending['estadoUI']
  ): Promise<void> {
    if (!this.codTerminal) return;
    try {
      const db = await this._db;
      await db.put(STORE_PENDING, {
        savedAt: Date.now(), codTerminal: this.codTerminal, payload, estadoUI
      }, this.pendingKey);
    } catch {
      // Error al guardar pending en IDB — si falla aquí, una pérdida de conexión no será recuperable;
      // verificar storage disponible y que el browser no esté en modo privado
    }
  }

  async loadPending(): Promise<VentaPending | null> {
    try {
      const db      = await this._db;
      const pending = await db.get(STORE_PENDING, this.pendingKey) as VentaPending | undefined;
      if (!pending || pending.codTerminal !== this.codTerminal) return null;
      return pending;
    } catch { /* Error al leer pending de IDB — se devuelve null */ return null; }
  }

  /** Llamar cuando el servidor confirma el guardado exitoso */
  async clearPending(): Promise<void> {
    try { const db = await this._db; await db.delete(STORE_PENDING, this.pendingKey); }
    catch { /* Error al borrar pending de IDB — podría persistir en la próxima sesión */ }
  }

  // ── Helpers async ─────────────────────────────────────────────────────────

  async hasDraft():   Promise<boolean> { return (await this.loadDraft())   !== null; }
  async hasPending(): Promise<boolean> { return (await this.loadPending()) !== null; }

  async clearAll(): Promise<void> {
    await Promise.all([this.clearDraft(), this.clearPending()]);
  }

  // ── BroadcastChannel — detectar cambios desde otra pestaña ───────────────

  /**
   * BroadcastChannel reemplaza el window.storage event de localStorage.
   * Emite a otras pestañas con la misma terminal cuando el draft cambia.
   * Disponible en todos los browsers modernos (Chrome 54+, Firefox 38+, Safari 15.4+).
   */
  private readonly _bc = typeof BroadcastChannel !== 'undefined'
    ? new BroadcastChannel('m2pos_draft')
    : null;

  private broadcastDraftChange(): void {
    this._bc?.postMessage({ type: 'draft_changed', codTerminal: this.codTerminal });
  }

  /**
   * Observable — emite cuando OTRA pestaña modifica el draft de esta terminal.
   * Usar en el componente para mostrar aviso de conflicto entre pestañas.
   */
  readonly onExternalChange$: Observable<void> = this._bc
    ? fromEvent<MessageEvent>(this._bc, 'message').pipe(
        filter(e => e.data?.type === 'draft_changed' && e.data?.codTerminal === this.codTerminal),
        map(() => void 0)
      )
    : new Observable<void>();
}