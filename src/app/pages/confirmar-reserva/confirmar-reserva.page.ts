import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, type OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonContent,
  IonHeader,
  IonInput,
  IonSpinner,
  IonText,
  IonTitle,
  IonToolbar,
  ToastController,
} from '@ionic/angular';

import { formatImageUrl } from '../../core/constants/api.constants';
import {
  calcularNoches,
  formatearFechaLatina,
  toNumber,
} from '../../core/utils/formatters';
import type { Lugar } from '../../models/lugar.model';
import type { CrearReservaRequest } from '../../models/reserva.model';
import { AuthService } from '../../services/auth.service';
import { LugaresService } from '../../services/lugares.service';
import { ReservasService } from '../../services/reservas.service';

@Component({
  selector: 'app-confirmar-reserva',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonBackButton,
    IonButton,
    IonButtons,
    IonCard,
    IonCardContent,
    IonContent,
    IonHeader,
    IonInput,
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
        <ion-title>Confirmar Reserva</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      @if (isLoading) {
        <div class="center-box">
          <ion-spinner name="crescent" color="danger"></ion-spinner>
          <p>Preparando resumen...</p>
        </div>
      } @else if (lugar) {
        <div class="checkout-container">
          <!-- Resumen breve del alojamiento -->
          <ion-card class="place-summary-card">
            <ion-card-content class="summary-row">
              @if (fotoPrincipalUrl) {
                <img [src]="fotoPrincipalUrl" [alt]="lugar.nombre" class="thumb" />
              }
              <div class="summary-text">
                <h2>{{ lugar.nombre }}</h2>
                <p>{{ lugar.ciudad }}</p>
                <span>
                  {{ formatearFecha(fechaInicio) }} - {{ formatearFecha(fechaFin) }}
                </span>
              </div>
            </ion-card-content>
          </ion-card>

          <!-- Fechas de la estancia -->
          <ion-card>
            <ion-card-content>
              <h3 class="section-title">Fechas de tu viaje</h3>
              <div class="dates-grid">
                <ion-input
                  label="Llegada"
                  labelPlacement="stacked"
                  fill="outline"
                  type="date"
                  [(ngModel)]="fechaInicio"
                  (ngModelChange)="recalcularTotales()"
                ></ion-input>

                <ion-input
                  label="Salida"
                  labelPlacement="stacked"
                  fill="outline"
                  type="date"
                  [(ngModel)]="fechaFin"
                  (ngModelChange)="recalcularTotales()"
                ></ion-input>
              </div>
            </ion-card-content>
          </ion-card>

          <!-- Desglose de gastos -->
          <ion-card>
            <ion-card-content>
              <h3 class="section-title">Detalle de precios</h3>

              <div class="cost-row">
                <span>
                  {{ cantidadNoches }}
                  {{ cantidadNoches === 1 ? 'Noche' : 'Noches' }}
                  ({{ precioPorNoche.toFixed(2) }} $ / noche)
                </span>
                <strong>{{ precioNoches.toFixed(2) }} $</strong>
              </div>

              <div class="cost-row">
                <span>Costo de limpieza</span>
                <strong>{{ precioLimpieza.toFixed(2) }} $</strong>
              </div>

              <div class="cost-row">
                <span>Cobro por servicio (10%)</span>
                <strong>{{ precioServicio.toFixed(2) }} $</strong>
              </div>

              <div class="divider"></div>

              <div class="cost-row total-row">
                <span>Total</span>
                <strong>{{ precioTotal.toFixed(2) }} $</strong>
              </div>
            </ion-card-content>
          </ion-card>

          @if (errorMessage) {
            <div class="error-box ion-margin-bottom">
              <ion-text color="danger">{{ errorMessage }}</ion-text>
            </div>
          }

          <ion-button
            expand="block"
            color="danger"
            size="large"
            [disabled]="isSubmitting || !fechasValidas"
            (click)="confirmar()"
            class="ion-margin-top"
          >
            @if (isSubmitting) {
              <ion-spinner name="crescent"></ion-spinner>
            } @else {
              Confirmar Reserva
            }
          </ion-button>
        </div>
      } @else {
        <div class="center-box">
          <ion-text color="danger">
            {{ errorMessage || 'No se encontró el alojamiento.' }}
          </ion-text>
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
      .checkout-container {
        max-width: 520px;
        margin: 0 auto 24px;
      }
      .summary-row {
        display: flex;
        gap: 14px;
        align-items: center;
      }
      .thumb {
        width: 82px;
        height: 82px;
        border-radius: 10px;
        object-fit: cover;
        flex-shrink: 0;
      }
      .summary-text h2 {
        margin: 0 0 4px;
        font-size: 18px;
        font-weight: 700;
      }
      .summary-text p {
        margin: 0 0 4px;
        color: var(--ion-color-medium);
        font-size: 14px;
      }
      .summary-text span {
        font-size: 13px;
        font-weight: 600;
        color: var(--ion-color-danger);
      }
      .section-title {
        margin: 0 0 14px;
        font-size: 16px;
        font-weight: 700;
      }
      .dates-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 10px;
      }
      .cost-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
        font-size: 15px;
      }
      .divider {
        height: 1px;
        background: var(--ion-color-light-shade);
        margin: 14px 0;
      }
      .total-row {
        font-size: 19px;
        margin-bottom: 0;
      }
      .total-row strong {
        color: var(--ion-color-danger);
      }
      .error-box {
        padding: 10px 12px;
        border-radius: 8px;
        background: rgba(var(--ion-color-danger-rgb), 0.1);
        font-size: 14px;
      }
    `,
  ],
})
export class ConfirmarReservaPage implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private authService = inject(AuthService);
  private lugaresService = inject(LugaresService);
  private reservasService = inject(ReservasService);
  private toastCtrl = inject(ToastController);
  private cdr = inject(ChangeDetectorRef);

  lugar: Lugar | null = null;
  fotoPrincipalUrl = '';

  fechaInicio = '';
  fechaFin = '';

  cantidadNoches = 1;
  precioPorNoche = 0;
  precioNoches = 0;
  precioLimpieza = 0;
  precioServicio = 0;
  precioTotal = 0;

  isLoading = true;
  isSubmitting = false;
  errorMessage = '';

  get fechasValidas(): boolean {
    return Boolean(
      this.fechaInicio && this.fechaFin && this.fechaFin > this.fechaInicio
    );
  }

  ngOnInit(): void {
    const estadoBusqueda = this.lugaresService.getEstadoBusqueda();
    this.fechaInicio = estadoBusqueda.fechaInicio;
    this.fechaFin = estadoBusqueda.fechaFin;

    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.errorMessage = 'Alojamiento inválido.';
      this.isLoading = false;
      this.cdr.detectChanges();
      return;
    }

    this.cargarLugar(id);
  }

  formatearFecha(fechaIso: string): string {
    return formatearFechaLatina(fechaIso);
  }

  recalcularTotales(): void {
    if (!this.lugar) return;

    if (!this.fechasValidas) {
      this.errorMessage =
        'La fecha de salida debe ser posterior a la fecha de llegada.';
      this.cdr.detectChanges();
      return;
    }

    this.errorMessage = '';
    this.cantidadNoches = calcularNoches(this.fechaInicio, this.fechaFin);
    this.precioPorNoche = toNumber(this.lugar.precioNoche);
    this.precioNoches = Number(
      (this.precioPorNoche * this.cantidadNoches).toFixed(2)
    );
    this.precioLimpieza = Number(toNumber(this.lugar.costoLimpieza).toFixed(2));
    this.precioServicio = Number((this.precioNoches * 0.1).toFixed(2));
    this.precioTotal = Number(
      (this.precioNoches + this.precioLimpieza + this.precioServicio).toFixed(2)
    );
    this.cdr.detectChanges();
  }

  confirmar(): void {
    const cliente = this.authService.getUsuarioActual();
    if (!this.lugar || !cliente) {
      this.errorMessage = 'Debes iniciar sesión para completar la reserva.';
      this.cdr.detectChanges();
      return;
    }

    if (!this.fechasValidas) {
      this.errorMessage =
        'La fecha de salida debe ser posterior a la fecha de llegada.';
      this.cdr.detectChanges();
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.cdr.detectChanges();

    const payload: CrearReservaRequest = {
      lugar_id: this.lugar.id,
      cliente_id: cliente.id,
      fechaInicio: this.fechaInicio,
      fechaFin: this.fechaFin,
      precioNoches: this.precioNoches,
      precioLimpieza: this.precioLimpieza,
      precioServicio: this.precioServicio,
      precioTotal: this.precioTotal,
    };

    this.reservasService.crearReserva(payload).subscribe({
      next: async () => {
        this.isSubmitting = false;
        this.cdr.detectChanges();

        const estadoActual = this.lugaresService.getEstadoBusqueda();
        this.lugaresService.setEstadoBusqueda({
          ...estadoActual,
          fechaInicio: this.fechaInicio,
          fechaFin: this.fechaFin,
        });

        const toast = await this.toastCtrl.create({
          message: '¡Reserva confirmada con éxito!',
          duration: 2500,
          color: 'success',
          position: 'bottom',
        });
        await toast.present();

        this.router.navigateByUrl('/home', { replaceUrl: true });
      },
      error: (err: Error) => {
        this.isSubmitting = false;
        this.errorMessage = err.message;
        this.cdr.detectChanges();
      },
    });
  }

  private cargarLugar(id: number): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.cdr.detectChanges();

    this.lugaresService.getLugarPorId(id).subscribe({
      next: (data) => {
        this.lugar = data;
        this.fotoPrincipalUrl =
          data.fotos && data.fotos.length > 0
            ? formatImageUrl(data.fotos[0].url)
            : '';
        this.isLoading = false;
        this.recalcularTotales();
      },
      error: (err: Error) => {
        this.errorMessage = err.message;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }
}