import { CommonModule } from '@angular/common';
import {
  Component,
  type ElementRef,
  type OnDestroy,
  ViewChild,
  inject,
} from '@angular/core';
import { Router } from '@angular/router';
import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonContent,
  IonFooter,
  IonHeader,
  IonIcon,
  IonTitle,
  IonToolbar,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  closeOutline,
  homeOutline,
  listOutline,
  locationOutline,
  mapOutline,
  peopleOutline,
} from 'ionicons/icons';
import * as L from 'leaflet';

import { formatImageUrl } from '../../core/constants/api.constants';
import { toNumber } from '../../core/utils/formatters';
import type { Lugar } from '../../models/lugar.model';
import { LugaresService } from '../../services/lugares.service';

@Component({
  selector: 'app-resultados',
  standalone: true,
  imports: [
    CommonModule,
    IonBackButton,
    IonButton,
    IonButtons,
    IonCard,
    IonCardContent,
    IonContent,
    IonFooter,
    IonHeader,
    IonIcon,
    IonTitle,
    IonToolbar,
  ],
  template: `
    <ion-header>
      <ion-toolbar color="danger">
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/home"></ion-back-button>
        </ion-buttons>
        <ion-title>Resultados ({{ lugares.length }})</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content [scrollY]="vistaActual === 'lista'">
      @if (lugares.length === 0) {
        <div class="empty-state">
          <ion-icon name="home-outline" color="medium"></ion-icon>
          <h3>Sin resultados</h3>
          <p>No se encontraron lugares con los filtros aplicados.</p>
        </div>
      } @else if (vistaActual === 'lista') {
        <div class="list-container">
          @for (lugar of lugares; track lugar.id) {
            <ion-card button (click)="verDetalle(lugar.id)" class="lugar-card">
              <div class="image-wrapper">
                @if (getPrimeraFoto(lugar)) {
                  <img [src]="getPrimeraFoto(lugar)" [alt]="lugar.nombre" />
                } @else {
                  <div class="placeholder-img">
                    <ion-icon name="home-outline"></ion-icon>
                  </div>
                }
                <span class="price-badge">
                  {{ formatPrecio(lugar.precioNoche) }} $ / noche
                </span>
              </div>

              <ion-card-content>
                <h2 class="lugar-title">{{ lugar.nombre }}</h2>
                <p class="lugar-desc">{{ lugar.descripcion }}</p>

                <div class="lugar-meta">
                  <span>
                    <ion-icon name="location-outline"></ion-icon>
                    {{ lugar.ciudad }}
                  </span>
                  <span>
                    <ion-icon name="people-outline"></ion-icon>
                    {{ lugar.cantPersonas }}
                    {{ lugar.cantPersonas === 1 ? 'persona' : 'personas' }}
                  </span>
                </div>
              </ion-card-content>
            </ion-card>
          }
        </div>
      } @else {
        <div class="map-wrapper">
          <div #mapContainer class="map-container"></div>

          @if (lugarSeleccionadoMapa) {
            <ion-card
              button
              (click)="verDetalle(lugarSeleccionadoMapa.id)"
              class="map-preview-card"
            >
              <ion-card-content class="preview-content">
                <div class="preview-thumb">
                  @if (getPrimeraFoto(lugarSeleccionadoMapa)) {
                    <img
                      [src]="getPrimeraFoto(lugarSeleccionadoMapa)"
                      [alt]="lugarSeleccionadoMapa.nombre"
                    />
                  } @else {
                    <div class="placeholder-img">
                      <ion-icon name="home-outline"></ion-icon>
                    </div>
                  }
                </div>

                <div class="preview-info">
                  <div class="preview-header">
                    <h3>{{ lugarSeleccionadoMapa.nombre }}</h3>
                    <ion-button
                      fill="clear"
                      size="small"
                      color="medium"
                      (click)="cerrarPreview($event)"
                    >
                      <ion-icon slot="icon-only" name="close-outline"></ion-icon>
                    </ion-button>
                  </div>
                  <p class="preview-desc">{{ lugarSeleccionadoMapa.descripcion }}</p>
                  <div class="preview-footer">
                    <span>{{ lugarSeleccionadoMapa.cantPersonas }} personas</span>
                    <strong>
                      {{ formatPrecio(lugarSeleccionadoMapa.precioNoche) }} $ / noche
                    </strong>
                  </div>
                </div>
              </ion-card-content>
            </ion-card>
          }
        </div>
      }
    </ion-content>

    @if (lugares.length > 0) {
      <ion-footer>
        <ion-toolbar class="ion-padding-horizontal">
          <ion-button expand="block" color="danger" (click)="alternarVista()">
            @if (vistaActual === 'lista') {
              <ion-icon slot="start" name="map-outline"></ion-icon>
              Vista de mapa
            } @else {
              <ion-icon slot="start" name="list-outline"></ion-icon>
              Vista de lista
            }
          </ion-button>
        </ion-toolbar>
      </ion-footer>
    }
  `,
  styles: [
    `
      .empty-state {
        text-align: center;
        padding: 64px 24px;
        color: var(--ion-color-medium);
      }
      .empty-state ion-icon {
        font-size: 64px;
      }
      .list-container {
        max-width: 640px;
        margin: 0 auto;
        padding: 8px 12px 16px;
      }
      .lugar-card {
        margin: 12px 0;
        border-radius: 14px;
        overflow: hidden;
      }
      .image-wrapper {
        position: relative;
        width: 100%;
        height: 200px;
        background: var(--ion-color-light);
      }
      .image-wrapper img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
      }
      .placeholder-img {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #e9ecef;
        color: #868e96;
        font-size: 42px;
      }
      .price-badge {
        position: absolute;
        bottom: 10px;
        right: 10px;
        background: rgba(0, 0, 0, 0.78);
        color: #ffffff;
        padding: 6px 10px;
        border-radius: 8px;
        font-weight: 700;
        font-size: 14px;
      }
      .lugar-title {
        margin: 0 0 6px;
        font-size: 18px;
        font-weight: 700;
        color: var(--ion-color-dark);
      }
      .lugar-desc {
        margin: 0 0 12px;
        font-size: 14px;
        color: var(--ion-color-medium);
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
      .lugar-meta {
        display: flex;
        justify-content: space-between;
        font-size: 13px;
        color: var(--ion-color-dark);
      }
      .lugar-meta span {
        display: inline-flex;
        align-items: center;
        gap: 4px;
      }
      .map-wrapper {
        position: relative;
        width: 100%;
        height: 100%;
      }
      .map-container {
        width: 100%;
        height: 100%;
      }
      .map-preview-card {
        position: absolute;
        bottom: 12px;
        left: 12px;
        right: 12px;
        z-index: 1000;
        margin: 0 auto;
        max-width: 520px;
        border-radius: 14px;
        box-shadow: 0 6px 18px rgba(0, 0, 0, 0.25);
      }
      .preview-content {
        display: flex;
        gap: 12px;
        padding: 10px;
        align-items: center;
      }
      .preview-thumb {
        width: 88px;
        height: 88px;
        border-radius: 10px;
        overflow: hidden;
        flex-shrink: 0;
      }
      .preview-thumb img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      .preview-info {
        flex: 1;
        min-width: 0;
      }
      .preview-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .preview-header h3 {
        margin: 0;
        font-size: 16px;
        font-weight: 700;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .preview-desc {
        margin: 2px 0 8px;
        font-size: 13px;
        color: var(--ion-color-medium);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .preview-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 13px;
      }
      .preview-footer strong {
        color: var(--ion-color-danger);
      }
    `,
  ],
})
export class ResultadosPage implements OnDestroy {
  @ViewChild('mapContainer') mapContainer?: ElementRef<HTMLDivElement>;

  private lugaresService = inject(LugaresService);
  private router = inject(Router);

  lugares: Lugar[] = this.lugaresService.getResultados();
  vistaActual: 'lista' | 'mapa' = 'lista';
  lugarSeleccionadoMapa: Lugar | null = null;

  private map?: L.Map;

  constructor() {
    addIcons({
      closeOutline,
      homeOutline,
      listOutline,
      locationOutline,
      mapOutline,
      peopleOutline,
    });
  }

  ionViewWillEnter(): void {
    this.lugares = this.lugaresService.getResultados();
  }

  ngOnDestroy(): void {
    this.destruirMapa();
  }

  getPrimeraFoto(lugar: Lugar): string {
    if (lugar.fotos && lugar.fotos.length > 0) {
      return formatImageUrl(lugar.fotos[0].url);
    }
    return '';
  }

  formatPrecio(precio: string | number): string {
    return toNumber(precio).toFixed(0);
  }

  alternarVista(): void {
    if (this.vistaActual === 'lista') {
      this.vistaActual = 'mapa';
      setTimeout(() => this.inicializarMapa(), 100);
    } else {
      this.destruirMapa();
      this.lugarSeleccionadoMapa = null;
      this.vistaActual = 'lista';
    }
  }

  cerrarPreview(event: Event): void {
    event.stopPropagation();
    this.lugarSeleccionadoMapa = null;
  }

  verDetalle(lugarId: number): void {
    this.router.navigate(['/detalle-lugar', lugarId]);
  }

  private inicializarMapa(): void {
    if (!this.mapContainer) return;

    this.destruirMapa();

    // Centro inicial por defecto en Santa Cruz
    const centroInicial: [number, number] = [-17.7833, -63.1821];

    this.map = L.map(this.mapContainer.nativeElement).setView(centroInicial, 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(this.map);

    const coordenadasValidas: [number, number][] = [];

    for (const lugar of this.lugares) {
      const lat = toNumber(lugar.latitud, Number.NaN);
      const lng = toNumber(lugar.longitud, Number.NaN);

      if (Number.isNaN(lat) || Number.isNaN(lng) || (lat === 0 && lng === 0)) {
        continue;
      }

      coordenadasValidas.push([lat, lng]);

      // Marcador personalizado estilo Airbnb con el precio (evita errores de rutas de íconos)
      const iconoPrecio = L.divIcon({
        className: 'custom-price-marker',
        html: `<div style="
          background: #eb445a;
          color: #ffffff;
          font-weight: 700;
          font-size: 13px;
          padding: 5px 9px;
          border-radius: 16px;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 8px rgba(0,0,0,0.35);
          white-space: nowrap;
          text-align: center;
        ">${this.formatPrecio(lugar.precioNoche)} $</div>`,
        iconSize: [68, 30],
        iconAnchor: [34, 15],
      });

      const marker = L.marker([lat, lng], { icon: iconoPrecio }).addTo(this.map);

      marker.on('click', () => {
        this.lugarSeleccionadoMapa = lugar;
      });
    }

    if (coordenadasValidas.length === 1) {
      this.map.setView(coordenadasValidas[0], 15);
    } else if (coordenadasValidas.length > 1) {
      this.map.fitBounds(L.latLngBounds(coordenadasValidas), {
        padding: [40, 40],
      });
    }

    setTimeout(() => {
      this.map?.invalidateSize();
    }, 200);
  }

  private destruirMapa(): void {
    if (this.map) {
      this.map.remove();
      this.map = undefined;
    }
  }
}