// ============================================================
//  LeafletMapComponent
//  Mapa Leaflet con marcador arrastrable
//  Uso:
//    <app-leaflet-map
//      [lat]="cliente.latitud" [lng]="cliente.longitud"
//      [popupText]="cliente.razonSocial"
//      (coordsChanged)="onMapClick($event)"/>
// ============================================================
import {
  Component, Input, Output, EventEmitter,
  OnChanges, SimpleChanges, OnDestroy,
  AfterViewInit, ChangeDetectionStrategy,
  PLATFORM_ID, inject, ViewChild, ElementRef
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export interface LatLng { lat: number; lng: number; }

@Component({
  selector: 'app-leaflet-map',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div #mapContainer style="width:100%;height:380px;border-radius:12px;overflow:hidden;border:1.5px solid var(--border-color)"></div>`,
})
export class LeafletMapComponent implements AfterViewInit, OnChanges, OnDestroy {
  @ViewChild('mapContainer') mapRef!: ElementRef;

  @Input() lat  = -25.2969;
  @Input() lng  = -57.5949;
  @Input() zoom = 14;
  @Input() popupText = '';
  @Input() draggable = true;

  @Output() coordsChanged = new EventEmitter<LatLng>();

  private map: any;
  private marker: any;
  private L: any;
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  async ngAfterViewInit(): Promise<void> {
    if (!this.isBrowser) return;
    this.L = await import('leaflet');
    this.initMap();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.map || !this.marker) return;
    if (changes['lat'] || changes['lng']) {
      const pos = this.L.latLng(this.lat, this.lng);
      this.marker.setLatLng(pos);
      this.map.setView(pos);
    }
    if (changes['popupText'] && this.popupText) {
      this.marker.setPopupContent(this.popupText);
    }
  }

  ngOnDestroy(): void {
    this.map?.remove();
    this.map = null;
  }

  private initMap(): void {
    const L = this.L.default ?? this.L;

    // Fix icono default Leaflet en builds de producción
    const iconDefault = L.icon({
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconSize:    [25, 41],
      iconAnchor:  [12, 41],
      popupAnchor: [1, -34],
      shadowSize:  [41, 41],
    });

    this.map = L.map(this.mapRef.nativeElement).setView([this.lat, this.lng], this.zoom);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(this.map);

    this.marker = L.marker([this.lat, this.lng], {
      icon: iconDefault,
      draggable: this.draggable,
    }).addTo(this.map);

    if (this.popupText) {
      this.marker.bindPopup(this.popupText).openPopup();
    }

    // Click en el mapa mueve el marcador
    this.map.on('click', (e: any) => {
      const { lat, lng } = e.latlng;
      this.marker.setLatLng(e.latlng);
      this.coordsChanged.emit({ lat, lng });
    });

    // Drag del marcador
    this.marker.on('dragend', () => {
      const { lat, lng } = this.marker.getLatLng();
      this.coordsChanged.emit({ lat, lng });
    });
  }
}
