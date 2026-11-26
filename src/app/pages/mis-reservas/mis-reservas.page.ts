import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, type OnInit, inject } from '@angular/core';
import {
  IonBackButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonContent,
  IonHeader,
  IonIcon,
  IonRefresher,
  IonRefresherContent,
  IonSpinner,
  IonText,
  IonTitle,
  IonToolbar,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { calendarOutline, homeOutline } from 'ionicons/icons';

import { formatImageUrl } from '../../core/constants/api.constants';
import {
  calcularNoches,
  formatearFechaLatina,
  toNumber,
} from '../../core/utils/formatters';
import type { Lugar } from '../../models/lugar.model';
import type { Reserva } from '../../models/reserva.model';
import { AuthService } from '../../services/auth.service';
import { ReservasService } from '../../services/reservas.service';

@Component({
  selector: 'app-mis-reservas',
  standalone: true,
  imports: [
    CommonModule,
    IonBackButton,
    IonButtons,
    IonCard,
    IonCardContent,
    IonContent,
    IonHeader,
    IonIcon,
    IonRefresher,
    IonRefresherContent,
    IonSpinner,
    IonText,
    IonTitle,
    IonToolbar,
  ],
  template: `
    <ion-header>
      <ion-toolbar color="danger">
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/home"></ion-back-button>
        </ion-buttons>
        <ion-title>Mis Reservas</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <ion-refresher slot="fixed" (ionRefresh)="refrescar($event)">
        <ion-refresher-content></ion-refresher-content>
      </ion-refresher>

      @if (isLoading) {
        <div class="center-box">
          <ion-spinner name="crescent" color="danger"></ion-spinner>
          <p>Cargando tus reservas...</p>
        </div>
      } @else if (errorMessage) {
        <div class="center-box">
          <ion-text color="danger">{{ errorMessage }}</ion-text>
        </div>
      } @else if (reservas.length === 0) {
        <div class="center-box empty-state">
          <ion-icon name="calendar-outline" color="medium"></ion-icon>
          <h3>Aún no tienes reservas</h3>
          <p>Busca un alojamiento y realiza tu primera reserva.</p>
        </div>
      } @else {
        <div class="reservas-container">
          @for (reserva of reservas; track reserva.id) {
            <ion-card class="reserva-card">
              <ion-card-content class="card-row">
                <div class="thumb-box">
                  @if (getFotoLugar(reserva)) {
                    <img
                      [src]="getFotoLugar(reserva)"
                      [alt]="getLugar(reserva)?.nombre || 'Lugar'"
                    />
                  } @else {
                    <div class="placeholder-img">
                      <ion-icon name="home-outline"></ion-icon>
                    </div>
                  }
                </div>

                <div class="info-box">
                  <div class="header-line">
                    <h2>{{ getLugar(reserva)?.nombre || 'Alojamiento' }}</h2>
                    <span class="total-price">
                      {{ formatPrecio(reserva.precioTotal) }} $
                    </span>
                  </div>

                  <p class="city">
                    {{ getLugar(reserva)?.ciudad || 'Ciudad no especificada' }}
                  </p>

                  <p class="nights">
                    {{ getNoches(reserva) }}
                    {{ getNoches(reserva) === 1 ? 'Noche' : 'Noches' }}
                  </p>

                  <p class="dates">
                    Inicio de {{ formatFecha(reserva.fechaInicio) }}<br />
                    Finaliza el {{ formatFecha(reserva.fechaFin) }}
                  </p>

                  @if (getLugar(reserva)?.arrendatario?.nombrecompleto) {
                    <p class="host">
                      <strong>Anfitrión:</strong>
                      {{ getLugar(reserva)?.arrendatario?.nombrecompleto }}
                    </p>
                  }
                </div>
              </ion-card-content>
            </ion-card>
          }
        </div>
      }
    </ion-content>
  `,
  styles: [
    `
      .center-box {
        text-align: center;
        padding: 64px 24px;
      }
      .empty-state {
        color: var(--ion-color-medium);
      }
      .empty-state ion-icon {
        font-size: 64px;
      }
      .reservas-container {
        max-width: 600px;
        margin: 0 auto 24px;
      }
      .reserva-card {
        margin: 0 0 14px;
        border-radius: 14px;
      }
      .card-row {
        display: flex;
        gap: 14px;
        align-items: center;
      }
      .thumb-box {
        width: 92px;
        height: 92px;
        border-radius: 10px;
        overflow: hidden;
        flex-shrink: 0;
      }
      .thumb-box img {
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
        font-size: 36px;
      }
      .info-box {
        flex: 1;
        min-width: 0;
      }
      .header-line {
        display: flex;
        justify-content: space-between;
        align-items: baseline;
        gap: 8px;
      }
      .header-line h2 {
        margin: 0;
        font-size: 17px;
        font-weight: 700;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .total-price {
        font-size: 16px;
        font-weight: 700;
        color: var(--ion-color-danger);
        flex-shrink: 0;
      }
      .city {
        margin: 2px 0 6px;
        font-size: 13px;
        color: var(--ion-color-medium);
      }
      .nights {
        margin: 0 0 4px;
        font-size: 14px;
        font-weight: 600;
      }
      .dates {
        margin: 0 0 6px;
        font-size: 13px;
        line-height: 1.4;
      }
      .host {
        margin: 0;
        font-size: 13px;
        color: var(--ion-color-dark);
      }
    `,
  ],
})
export class MisReservasPage implements OnInit {
  private authService = inject(AuthService);
  private reservasService = inject(ReservasService);
  private cdr = inject(ChangeDetectorRef);

  reservas: Reserva[] = [];
  isLoading = true;
  errorMessage = '';

  constructor() {
    addIcons({ calendarOutline, homeOutline });
  }

  ngOnInit(): void {
    this.cargarReservas();
  }

  ionViewWillEnter(): void {
    this.cargarReservas();
  }

  cargarReservas(onComplete?: () => void): void {
    const cliente = this.authService.getUsuarioActual();
    if (!cliente) {
      this.isLoading = false;
      this.cdr.detectChanges();
      onComplete?.();
      return;
    }

    this.errorMessage = '';
    this.reservasService.getReservasPorCliente(cliente.id).subscribe({
      next: (data) => {
        this.reservas = Array.isArray(data) ? data : [];
        this.isLoading = false;
        this.cdr.detectChanges();
        onComplete?.();
      },
      error: (err: Error) => {
        this.errorMessage = err.message;
        this.isLoading = false;
        this.cdr.detectChanges();
        onComplete?.();
      },
    });
  }

  refrescar(event: CustomEvent): void {
    this.cargarReservas(() => {
      (event.target as HTMLIonRefresherElement).complete();
    });
  }

  getLugar(reserva: Reserva): Lugar | null {
    if (!reserva.lugar) return null;
    if (Array.isArray(reserva.lugar)) {
      return reserva.lugar.length > 0 ? reserva.lugar[0] : null;
    }
    return reserva.lugar as unknown as Lugar;
  }

  getFotoLugar(reserva: Reserva): string {
    const lugar = this.getLugar(reserva);
    if (lugar?.fotos && lugar.fotos.length > 0) {
      return formatImageUrl(lugar.fotos[0].url);
    }
    return '';
  }

  getNoches(reserva: Reserva): number {
    return calcularNoches(reserva.fechaInicio, reserva.fechaFin);
  }

  formatFecha(fechaIso: string): string {
    return formatearFechaLatina(fechaIso);
  }

  formatPrecio(precio: string | number): string {
    return toNumber(precio).toFixed(0);
  }
}