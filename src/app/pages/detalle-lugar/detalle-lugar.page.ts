import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, type OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonChip,
  IonContent,
  IonFooter,
  IonHeader,
  IonIcon,
  IonLabel,
  IonSpinner,
  IonText,
  IonTitle,
  IonToolbar,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  bedOutline,
  carOutline,
  homeOutline,
  locationOutline,
  peopleOutline,
  personCircleOutline,
  waterOutline,
  wifiOutline,
} from 'ionicons/icons';

import { formatImageUrl } from '../../core/constants/api.constants';
import { toNumber } from '../../core/utils/formatters';
import type { Lugar } from '../../models/lugar.model';
import { LugaresService } from '../../services/lugares.service';

@Component({
  selector: 'app-detalle-lugar',
  standalone: true,
  imports: [
    CommonModule,
    IonBackButton,
    IonButton,
    IonButtons,
    IonChip,
    IonContent,
    IonFooter,
    IonHeader,
    IonIcon,
    IonLabel,
    IonSpinner,
    IonText,
    IonTitle,
    IonToolbar,
  ],
  template: `
    <ion-header>
      <ion-toolbar color="danger">
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/resultados"></ion-back-button>
        </ion-buttons>
        <ion-title>{{ lugar?.nombre || 'Detalle del Lugar' }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      @if (isLoading) {
        <div class="center-box">
          <ion-spinner name="crescent" color="danger"></ion-spinner>
          <p>Cargando alojamiento...</p>
        </div>
      } @else if (errorMessage) {
        <div class="center-box">
          <ion-text color="danger">{{ errorMessage }}</ion-text>
        </div>
      } @else if (lugar) {
        <div class="detail-container">
          <!-- Foto principal grande -->
          <div class="main-photo-box">
            @if (fotoSeleccionadaUrl) {
              <img [src]="fotoSeleccionadaUrl" [alt]="lugar.nombre" />
            } @else {
              <div class="placeholder-img">
                <ion-icon name="home-outline"></ion-icon>
              </div>
            }
            <div class="price-tag">
              {{ formatPrecio(lugar.precioNoche) }} $ / noche
            </div>
          </div>

          <!-- Miniaturas debajo (clic para agrandar) -->
          @if (fotosUrls.length > 1) {
            <div class="thumbnails-row">
              @for (url of fotosUrls; track url) {
                <button
                  type="button"
                  class="thumb-btn"
                  [class.active]="url === fotoSeleccionadaUrl"
                  (click)="seleccionarFoto(url)"
                >
                  <img [src]="url" alt="Miniatura" />
                </button>
              }
            </div>
          }

          <div class="info-section">
            <h1 class="title">{{ lugar.nombre }}</h1>

            <p class="city-line">
              <ion-icon name="location-outline"></ion-icon>
              {{ lugar.ciudad }}
            </p>

            <p class="description">{{ lugar.descripcion }}</p>

            <!-- Capacidad: Personas, Camas, Baños, Habitaciones -->
            <div class="chips-grid">
              <ion-chip outline="true">
                <ion-icon name="people-outline" color="danger"></ion-icon>
                <ion-label>
                  {{ lugar.cantPersonas }}
                  {{ lugar.cantPersonas === 1 ? 'Persona' : 'Personas' }}
                </ion-label>
              </ion-chip>

              <ion-chip outline="true">
                <ion-icon name="bed-outline" color="danger"></ion-icon>
                <ion-label>
                  {{ lugar.cantCamas }}
                  {{ lugar.cantCamas === 1 ? 'Cama' : 'Camas' }}
                </ion-label>
              </ion-chip>

              <ion-chip outline="true">
                <ion-icon name="water-outline" color="danger"></ion-icon>
                <ion-label>
                  {{ lugar.cantBanios }}
                  {{ lugar.cantBanios === 1 ? 'Baño' : 'Baños' }}
                </ion-label>
              </ion-chip>

              <ion-chip outline="true">
                <ion-icon name="home-outline" color="danger"></ion-icon>
                <ion-label>
                  {{ lugar.cantHabitaciones }}
                  {{ lugar.cantHabitaciones === 1 ? 'Habitación' : 'Habitaciones' }}
                </ion-label>
              </ion-chip>
            </div>

            <!-- Anfitrión y servicios -->
            <div class="details-card">
              <div class="detail-row">
                <ion-icon name="person-circle-outline" color="danger"></ion-icon>
                <span>
                  <strong>Anfitrión:</strong>
                  {{ lugar.arrendatario?.nombrecompleto || 'No especificado' }}
                </span>
              </div>

              <div class="detail-row">
                <ion-icon name="wifi-outline" color="danger"></ion-icon>
                <span>
                  <strong>Wi-Fi:</strong>
                  {{ lugar.tieneWifi === 1 ? 'Tiene Wi-Fi' : 'No tiene Wi-Fi' }}
                </span>
              </div>

              <div class="detail-row">
                <ion-icon name="car-outline" color="danger"></ion-icon>
                <span>
                  <strong>Parqueo:</strong>
                  @if (lugar.cantVehiculosParqueo > 0) {
                    Sí, para {{ lugar.cantVehiculosParqueo }}
                    {{ lugar.cantVehiculosParqueo === 1 ? 'vehículo' : 'vehículos' }}
                  } @else {
                    No tiene parqueo
                  }
                </span>
              </div>
            </div>
          </div>
        </div>
      }
    </ion-content>

    @if (lugar) {
      <ion-footer>
        <ion-toolbar class="ion-padding-horizontal">
          <div class="footer-bar">
            <div class="footer-price">
              <strong>{{ formatPrecio(lugar.precioNoche) }} $</strong>
              <span>/ noche</span>
            </div>
            <ion-button color="danger" (click)="irAReservar()">
              Reservar
            </ion-button>
          </div>
        </ion-toolbar>
      </ion-footer>
    }
  `,
  styles: [
    `
      .center-box {
        text-align: center;
        padding: 64px 24px;
      }
      .detail-container {
        max-width: 680px;
        margin: 0 auto 24px;
      }
      .main-photo-box {
        position: relative;
        width: 100%;
        height: 270px;
        background: #e9ecef;
      }
      .main-photo-box img {
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
        font-size: 56px;
        color: #868e96;
      }
      .price-tag {
        position: absolute;
        bottom: 12px;
        right: 12px;
        background: rgba(0, 0, 0, 0.78);
        color: #ffffff;
        padding: 6px 12px;
        border-radius: 8px;
        font-weight: 700;
        font-size: 15px;
      }
      .thumbnails-row {
        display: flex;
        gap: 10px;
        overflow-x: auto;
        padding: 12px 16px 4px;
      }
      .thumb-btn {
        padding: 0;
        border: 2px solid transparent;
        border-radius: 8px;
        overflow: hidden;
        width: 74px;
        height: 60px;
        flex-shrink: 0;
        background: transparent;
        cursor: pointer;
      }
      .thumb-btn.active {
        border-color: var(--ion-color-danger);
      }
      .thumb-btn img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
      }
      .info-section {
        padding: 16px;
      }
      .title {
        margin: 0 0 6px;
        font-size: 24px;
        font-weight: 700;
      }
      .city-line {
        display: flex;
        align-items: center;
        gap: 4px;
        margin: 0 0 12px;
        color: var(--ion-color-medium);
        font-size: 14px;
      }
      .description {
        margin: 0 0 16px;
        font-size: 15px;
        line-height: 1.5;
      }
      .chips-grid {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        margin-bottom: 16px;
      }
      .details-card {
        border: 1px solid var(--ion-color-light-shade);
        border-radius: 12px;
        padding: 14px;
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      .detail-row {
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 15px;
      }
      .detail-row ion-icon {
        font-size: 22px;
        flex-shrink: 0;
      }
      .footer-bar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 6px 0;
      }
      .footer-price strong {
        font-size: 20px;
        color: var(--ion-color-danger);
        margin-right: 4px;
      }
      .footer-price span {
        font-size: 14px;
        color: var(--ion-color-medium);
      }
    `,
  ],
})
export class DetalleLugarPage implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private lugaresService = inject(LugaresService);
  private cdr = inject(ChangeDetectorRef);

  lugar: Lugar | null = null;
  fotosUrls: string[] = [];
  fotoSeleccionadaUrl = '';
  isLoading = true;
  errorMessage = '';

  constructor() {
    addIcons({
      bedOutline,
      carOutline,
      homeOutline,
      locationOutline,
      peopleOutline,
      personCircleOutline,
      waterOutline,
      wifiOutline,
    });
  }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = Number(idParam);

    if (!id) {
      this.errorMessage = 'Lugar inválido.';
      this.isLoading = false;
      this.cdr.detectChanges();
      return;
    }

    this.cargarDetalle(id);
  }

  seleccionarFoto(url: string): void {
    this.fotoSeleccionadaUrl = url;
    this.cdr.detectChanges();
  }

  formatPrecio(precio: string | number): string {
    return toNumber(precio).toFixed(0);
  }

  irAReservar(): void {
    if (!this.lugar) return;
    this.router.navigate(['/confirmar-reserva', this.lugar.id]);
  }

  private cargarDetalle(id: number): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.cdr.detectChanges();

    this.lugaresService.getLugarPorId(id).subscribe({
      next: (data) => {
        this.lugar = data;
        this.fotosUrls = (data.fotos ?? [])
          .map((f) => formatImageUrl(f.url))
          .filter((u) => u.length > 0);
        this.fotoSeleccionadaUrl = this.fotosUrls[0] ?? '';
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err: Error) => {
        this.errorMessage = err.message;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }
}