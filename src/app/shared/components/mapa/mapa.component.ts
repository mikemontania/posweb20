// ============================================================
//  MapaComponent — Leaflet (reemplaza @agm/core)
//  Uso:
//    <app-mapa
//      [markers]="listaMarcadores"
//      [lat]="-25.2637"
//      [lng]="-57.5759"
//      [zoom]="13"
//      (markerClick)="onMarkerClick($event)"
//    />
//
//  Marcador:
//    { lat, lng, label?, title?, color?, data? }
// ============================================================
import {
  Component, Input, Output, EventEmitter,
  AfterViewInit, OnDestroy, OnChanges, SimpleChanges,
  ViewChild, ElementRef, ChangeDetectionStrategy, NgZone
} from '@angular/core';

export interface MapMarker {
  lat:    number;
  lng:    number;
  label?: string;
  title?: string;
  color?: 'blue' | 'red' | 'green' | 'orange' | 'purple';
  data?:  any;
}

@Component({
  selector: 'app-mapa',
  standalone: true,
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="mapa-wrap">
      @if (loading) {
        <div class="mapa-skeleton">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/>
            <line x1="9" y1="3" x2="9" y2="18"/>
            <line x1="15" y1="6" x2="15" y2="21"/>
          </svg>
          <span>Cargando mapa...</span>
        </div>
      }
      <div #mapContainer class="mapa-container" [style.height.px]="height"></div>
    </div>
  `,
  styles: [`
    .mapa-wrap { position: relative; width: 100%; border-radius: var(--radius-lg); overflow: hidden; }
    .mapa-container { width: 100%; }
    .mapa-skeleton {
      position: absolute; inset: 0; z-index: 1;
      background: var(--bg-surface-2);
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      gap: .75rem; color: var(--text-muted); font-size: .875rem;
    }
  `]
})
export class MapaComponent implements AfterViewInit, OnDestroy, OnChanges {
  @Input() markers: MapMarker[] = [];
  @Input() lat     = -25.2637;
  @Input() lng     = -57.5759;
  @Input() zoom    = 13;
  @Input() height  = 400;
  @Input() loading = false;

  @Output() markerClick = new EventEmitter<MapMarker>();
  @Output() mapClick    = new EventEmitter<{ lat: number; lng: number }>();

  @ViewChild('mapContainer') containerRef!: ElementRef<HTMLDivElement>;

  private map:        any;
  private L:          any;
  private leafletMarkers: any[] = [];

  constructor(private ngZone: NgZone) {}

  async ngAfterViewInit(): Promise<void> {
    await this.initMap();
  }

  async ngOnChanges(changes: SimpleChanges): Promise<void> {
    if (changes['markers'] && this.map) {
      this.refreshMarkers();
    }
    if ((changes['lat'] || changes['lng'] || changes['zoom']) && this.map) {
      this.map.setView([this.lat, this.lng], this.zoom);
    }
  }

  ngOnDestroy(): void {
    this.map?.remove();
  }

  private async initMap(): Promise<void> {
    // Lazy import de Leaflet
    this.L = await import('leaflet');

    // Fix íconos en producción (webpack)
    delete (this.L.Icon.Default.prototype as any)._getIconUrl;
    this.L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
      iconUrl:       'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
      shadowUrl:     'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    });

    this.ngZone.runOutsideAngular(() => {
      this.map = this.L.map(this.containerRef.nativeElement, {
        center: [this.lat, this.lng],
        zoom:   this.zoom,
        zoomControl: true,
      });

      // Tile layer OpenStreetMap (gratuito, sin API key)
      this.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(this.map);

      this.map.on('click', (e: any) => {
        this.ngZone.run(() =>
          this.mapClick.emit({ lat: e.latlng.lat, lng: e.latlng.lng })
        );
      });
    });

    this.refreshMarkers();
  }

  private refreshMarkers(): void {
    if (!this.L || !this.map) return;

    // Limpiar marcadores anteriores
    this.leafletMarkers.forEach(m => m.remove());
    this.leafletMarkers = [];

    this.markers.forEach(marker => {
      const icon = this.createIcon(marker.color ?? 'blue');
      const lm = this.L.marker([marker.lat, marker.lng], { icon, title: marker.title ?? '' });

      if (marker.label) {
        lm.bindPopup(`<strong>${marker.label}</strong>`);
      }

      lm.on('click', () => {
        this.ngZone.run(() => this.markerClick.emit(marker));
      });

      lm.addTo(this.map);
      this.leafletMarkers.push(lm);
    });

    // Auto-fit si hay múltiples marcadores
    if (this.markers.length > 1) {
      const group = this.L.featureGroup(this.leafletMarkers);
      this.map.fitBounds(group.getBounds().pad(0.1));
    }
  }

  private createIcon(color: string): any {
    const colors: Record<string, string> = {
      blue:   '#3B82F6', red:    '#EF4444', green:  '#10B981',
      orange: '#F59E0B', purple: '#8B5CF6'
    };
    const hex = colors[color] ?? colors['blue'];
    const svg = encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="36" viewBox="0 0 24 36">
        <path d="M12 0C5.37 0 0 5.37 0 12c0 9 12 24 12 24s12-15 12-24C24 5.37 18.63 0 12 0z"
          fill="${hex}" stroke="white" stroke-width="1.5"/>
        <circle cx="12" cy="12" r="5" fill="white"/>
      </svg>`);
    return this.L.icon({
      iconUrl:    `data:image/svg+xml,${svg}`,
      iconSize:   [24, 36],
      iconAnchor: [12, 36],
      popupAnchor:[0, -36],
    });
  }
}
