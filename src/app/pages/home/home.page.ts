import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonContent,
  IonHeader,
  IonIcon,
  IonInput,
  IonSpinner,
  IonText,
  IonTitle,
  IonToolbar,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  calendarOutline,
  logOutOutline,
  optionsOutline,
  searchOutline,
} from 'ionicons/icons';

import type { Usuario } from '../../models/usuario.model';
import { AuthService } from '../../services/auth.service';
import { LugaresService } from '../../services/lugares.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButtons,
    IonButton,
    IonIcon,
    IonCard,
    IonCardContent,
    IonInput,
    IonSpinner,
    IonText,
  ],
  template: `
    <ion-header>
      <ion-toolbar color="danger">
        <ion-title>Buscar Alojamientos</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="cerrarSesion()" title="Cerrar sesión">
            <ion-icon slot="icon-only" name="log-out-outline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div class="search-container">
        <div class="greeting">
          <h2>Hola, {{ usuario?.nombrecompleto }}</h2>
          <p>¿A dónde quieres viajar hoy?</p>
        </div>

        <ion-card>
          <ion-card-content>
            <form [formGroup]="busquedaForm" (ngSubmit)="buscar()">
              <ion-input
                label="Ingresa la Ciudad"
                labelPlacement="stacked"
                fill="outline"
                type="text"
                placeholder="Ej. Santa Cruz"
                formControlName="ciudad"
                class="ion-margin-bottom"
              ></ion-input>

              <ion-input
                label="Fecha de Llegada"
                labelPlacement="stacked"
                fill="outline"
                type="date"
                formControlName="fechaInicio"
                class="ion-margin-bottom"
              ></ion-input>

              <ion-input
                label="Fecha de Salida"
                labelPlacement="stacked"
                fill="outline"
                type="date"
                formControlName="fechaFin"
                class="ion-margin-bottom"
              ></ion-input>

              <ion-input
                label="Cantidad de huéspedes"
                labelPlacement="stacked"
                fill="outline"
                type="number"
                min="1"
                formControlName="cantPersonas"
                class="ion-margin-bottom"
              ></ion-input>

              @if (errorMessage) {
                <div class="error-box ion-margin-bottom">
                  <ion-text color="danger">{{ errorMessage }}</ion-text>
                </div>
              }

              <ion-button
                expand="block"
                color="danger"
                type="submit"
                [disabled]="busquedaForm.invalid || isLoading"
                class="ion-margin-top"
              >
                @if (isLoading) {
                  <ion-spinner name="crescent"></ion-spinner>
                } @else {
                  <ion-icon slot="start" name="search-outline"></ion-icon>
                  Buscar
                }
              </ion-button>

              <ion-button
                expand="block"
                fill="outline"
                color="danger"
                type="button"
                (click)="irABusquedaAvanzada()"
                [disabled]="isLoading"
                class="ion-margin-top"
              >
                <ion-icon slot="start" name="options-outline"></ion-icon>
                Búsqueda Avanzada
              </ion-button>

              <ion-button
                expand="block"
                fill="clear"
                color="medium"
                type="button"
                (click)="irAMisReservas()"
                [disabled]="isLoading"
                class="ion-margin-top"
              >
                <ion-icon slot="start" name="calendar-outline"></ion-icon>
                Ver Reservas
              </ion-button>
            </form>
          </ion-card-content>
        </ion-card>
      </div>
    </ion-content>
  `,
  styles: [
    `
      .search-container {
        max-width: 480px;
        margin: 8px auto;
      }
      .greeting {
        padding: 4px 8px 12px;
      }
      .greeting h2 {
        margin: 0 0 4px;
        font-weight: 700;
        font-size: 22px;
      }
      .greeting p {
        margin: 0;
        color: var(--ion-color-medium);
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
export class HomePage {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private lugaresService = inject(LugaresService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  usuario: Usuario | null = this.authService.getUsuarioActual();
  isLoading = false;
  errorMessage = '';

  busquedaForm = this.fb.nonNullable.group({
    ciudad: [this.lugaresService.getEstadoBusqueda().ciudad],
    fechaInicio: [
      this.lugaresService.getEstadoBusqueda().fechaInicio,
      [Validators.required],
    ],
    fechaFin: [
      this.lugaresService.getEstadoBusqueda().fechaFin,
      [Validators.required],
    ],
    cantPersonas: [
      this.lugaresService.getEstadoBusqueda().cantPersonas,
      [Validators.required, Validators.min(1)],
    ],
  });

  constructor() {
    addIcons({
      logOutOutline,
      searchOutline,
      optionsOutline,
      calendarOutline,
    });
  }

  ionViewWillEnter(): void {
    this.usuario = this.authService.getUsuarioActual();
    const estado = this.lugaresService.getEstadoBusqueda();

    this.busquedaForm.patchValue({
      ciudad: estado.ciudad,
      fechaInicio: estado.fechaInicio,
      fechaFin: estado.fechaFin,
      cantPersonas: estado.cantPersonas,
    });

    this.isLoading = false;
    this.errorMessage = '';
    this.cdr.detectChanges();
  }

  buscar(): void {
    if (this.busquedaForm.invalid) return;

    const formValue = this.busquedaForm.getRawValue();

    if (formValue.fechaFin <= formValue.fechaInicio) {
      this.errorMessage =
        'La fecha de salida debe ser posterior a la fecha de llegada.';
      this.cdr.detectChanges();
      return;
    }

    this.errorMessage = '';
    this.isLoading = true;
    this.cdr.detectChanges();

    this.lugaresService.setEstadoBusqueda({
      ciudad: formValue.ciudad.trim(),
      fechaInicio: formValue.fechaInicio,
      fechaFin: formValue.fechaFin,
      cantPersonas: Number(formValue.cantPersonas) || 1,
    });

    this.lugaresService.buscarSimple(formValue.ciudad).subscribe({
      next: (lugares) => {
        const huespedes = Number(formValue.cantPersonas) || 1;
        const filtrados = lugares.filter((l) => l.cantPersonas >= huespedes);
        this.lugaresService.setResultados(filtrados);

        this.isLoading = false;
        this.cdr.detectChanges();
        this.router.navigateByUrl('/resultados');
      },
      error: (err: Error) => {
        this.isLoading = false;
        this.errorMessage = err.message;
        this.cdr.detectChanges();
      },
    });
  }

  irABusquedaAvanzada(): void {
    const formValue = this.busquedaForm.getRawValue();
    this.lugaresService.setEstadoBusqueda({
      ciudad: formValue.ciudad.trim(),
      fechaInicio: formValue.fechaInicio,
      fechaFin: formValue.fechaFin,
      cantPersonas: Number(formValue.cantPersonas) || 1,
    });
    this.router.navigateByUrl('/busqueda-avanzada');
  }

  irAMisReservas(): void {
    this.router.navigateByUrl('/mis-reservas');
  }

  cerrarSesion(): void {
    this.authService.logout();
    this.router.navigateByUrl('/login', { replaceUrl: true });
  }
}
