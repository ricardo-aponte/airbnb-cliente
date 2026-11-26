import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonCol,
  IonContent,
  IonGrid,
  IonHeader,
  IonIcon,
  IonInput,
  IonRow,
  IonSelect,
  IonSelectOption,
  IonSpinner,
  IonText,
  IonTitle,
  IonToolbar,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { searchOutline } from 'ionicons/icons';

import type { BusquedaAvanzadaRequest } from '../../models/busqueda.model';
import { LugaresService } from '../../services/lugares.service';

@Component({
  selector: 'app-busqueda-avanzada',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonBackButton,
    IonTitle,
    IonContent,
    IonInput,
    IonSelect,
    IonSelectOption,
    IonButton,
    IonSpinner,
    IonText,
    IonIcon,
    IonGrid,
    IonRow,
    IonCol,
  ],
  template: `
    <ion-header>
      <ion-toolbar color="danger">
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/home"></ion-back-button>
        </ion-buttons>
        <ion-title>Búsqueda Avanzada</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div class="form-container">
        <form [formGroup]="avanzadaForm" (ngSubmit)="buscar()">
          <p class="section-title">Datos principales</p>

          <ion-input
            label="Ciudad *"
            labelPlacement="stacked"
            fill="outline"
            type="text"
            placeholder="Ej. Santa Cruz"
            formControlName="ciudad"
            class="ion-margin-bottom"
          ></ion-input>

          <ion-grid class="ion-no-padding">
            <ion-row>
              <ion-col size="6" class="pr-col">
                <ion-input
                  label="Llegada *"
                  labelPlacement="stacked"
                  fill="outline"
                  type="date"
                  formControlName="fechaInicio"
                  class="ion-margin-bottom"
                ></ion-input>
              </ion-col>
              <ion-col size="6" class="pl-col">
                <ion-input
                  label="Salida *"
                  labelPlacement="stacked"
                  fill="outline"
                  type="date"
                  formControlName="fechaFin"
                  class="ion-margin-bottom"
                ></ion-input>
              </ion-col>
            </ion-row>
          </ion-grid>

          <p class="section-title">Filtros opcionales del lugar</p>

          <ion-input
            label="Nombre del lugar"
            labelPlacement="stacked"
            fill="outline"
            type="text"
            placeholder="Ej. Casa Azul"
            formControlName="nombre"
            class="ion-margin-bottom"
          ></ion-input>

          <ion-input
            label="Descripción"
            labelPlacement="stacked"
            fill="outline"
            type="text"
            placeholder="Ej. piscina, centro"
            formControlName="descripcion"
            class="ion-margin-bottom"
          ></ion-input>

          <ion-grid class="ion-no-padding">
            <ion-row>
              <ion-col size="6" class="pr-col">
                <ion-input
                  label="Huéspedes"
                  labelPlacement="stacked"
                  fill="outline"
                  type="number"
                  min="1"
                  formControlName="cantPersonas"
                  class="ion-margin-bottom"
                ></ion-input>
              </ion-col>
              <ion-col size="6" class="pl-col">
                <ion-input
                  label="Habitaciones"
                  labelPlacement="stacked"
                  fill="outline"
                  type="number"
                  min="1"
                  formControlName="cantHabitaciones"
                  class="ion-margin-bottom"
                ></ion-input>
              </ion-col>
            </ion-row>

            <ion-row>
              <ion-col size="6" class="pr-col">
                <ion-input
                  label="Camas"
                  labelPlacement="stacked"
                  fill="outline"
                  type="number"
                  min="1"
                  formControlName="cantCamas"
                  class="ion-margin-bottom"
                ></ion-input>
              </ion-col>
              <ion-col size="6" class="pl-col">
                <ion-input
                  label="Baños"
                  labelPlacement="stacked"
                  fill="outline"
                  type="number"
                  min="1"
                  formControlName="cantBanios"
                  class="ion-margin-bottom"
                ></ion-input>
              </ion-col>
            </ion-row>

            <ion-row>
              <ion-col size="6" class="pr-col">
                <ion-input
                  label="Vehículos parqueo"
                  labelPlacement="stacked"
                  fill="outline"
                  type="number"
                  min="0"
                  formControlName="cantVehiculosParqueo"
                  class="ion-margin-bottom"
                ></ion-input>
              </ion-col>
              <ion-col size="6" class="pl-col">
                <ion-input
                  label="Precio por noche ($)"
                  labelPlacement="stacked"
                  fill="outline"
                  type="number"
                  min="0"
                  formControlName="precioNoche"
                  class="ion-margin-bottom"
                ></ion-input>
              </ion-col>
            </ion-row>
          </ion-grid>

          <ion-select
            label="Wi-Fi"
            labelPlacement="stacked"
            fill="outline"
            formControlName="tieneWifi"
            interface="popover"
            class="ion-margin-bottom"
          >
            <ion-select-option value="">Cualquiera</ion-select-option>
            <ion-select-option value="1">Sí, con Wi-Fi</ion-select-option>
            <ion-select-option value="0">Sin Wi-Fi</ion-select-option>
          </ion-select>

          @if (errorMessage) {
            <div class="error-box ion-margin-bottom">
              <ion-text color="danger">{{ errorMessage }}</ion-text>
            </div>
          }

          <ion-button
            expand="block"
            color="danger"
            type="submit"
            [disabled]="avanzadaForm.invalid || isLoading"
            class="ion-margin-top ion-margin-bottom"
          >
            @if (isLoading) {
              <ion-spinner name="crescent"></ion-spinner>
            } @else {
              <ion-icon slot="start" name="search-outline"></ion-icon>
              Aplicar Filtros y Buscar
            }
          </ion-button>
        </form>
      </div>
    </ion-content>
  `,
  styles: [
    `
      .form-container {
        max-width: 520px;
        margin: 0 auto 24px;
      }
      .section-title {
        font-weight: 700;
        color: var(--ion-color-dark);
        margin: 12px 0;
        font-size: 15px;
      }
      .pr-col {
        padding-right: 6px;
      }
      .pl-col {
        padding-left: 6px;
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
export class BusquedaAvanzadaPage {
  private fb = inject(FormBuilder);
  private lugaresService = inject(LugaresService);
  private router = inject(Router);

  isLoading = false;
  errorMessage = '';

  private estadoInicial = this.lugaresService.getEstadoBusqueda();

  avanzadaForm = this.fb.group({
    ciudad: [this.estadoInicial.ciudad, [Validators.required]],
    fechaInicio: [this.estadoInicial.fechaInicio, [Validators.required]],
    fechaFin: [this.estadoInicial.fechaFin, [Validators.required]],
    nombre: [''],
    descripcion: [''],
    cantPersonas: [
      this.estadoInicial.cantPersonas > 1
        ? String(this.estadoInicial.cantPersonas)
        : '',
    ],
    cantCamas: [''],
    cantBanios: [''],
    cantHabitaciones: [''],
    tieneWifi: [''],
    cantVehiculosParqueo: [''],
    precioNoche: [''],
  });

  constructor() {
    addIcons({ searchOutline });
  }

  buscar(): void {
    if (this.avanzadaForm.invalid) return;

    const raw = this.avanzadaForm.getRawValue();
    const fechaInicio = raw.fechaInicio ?? '';
    const fechaFin = raw.fechaFin ?? '';

    if (fechaFin <= fechaInicio) {
      this.errorMessage =
        'La fecha de salida debe ser posterior a la fecha de llegada.';
      return;
    }

    this.errorMessage = '';
    this.isLoading = true;

    this.lugaresService.setEstadoBusqueda({
      ciudad: (raw.ciudad ?? '').trim(),
      fechaInicio,
      fechaFin,
      cantPersonas: Number(raw.cantPersonas) || 1,
    });

    const filtros: BusquedaAvanzadaRequest = {
      ciudad: (raw.ciudad ?? '').trim(),
    };

    if (raw.nombre?.trim()) filtros.nombre = raw.nombre.trim();
    if (raw.descripcion?.trim()) filtros.descripcion = raw.descripcion.trim();
    if (raw.cantPersonas) filtros.cantPersonas = Number(raw.cantPersonas);
    if (raw.cantCamas) filtros.cantCamas = Number(raw.cantCamas);
    if (raw.cantBanios) filtros.cantBanios = Number(raw.cantBanios);
    if (raw.cantHabitaciones) {
      filtros.cantHabitaciones = Number(raw.cantHabitaciones);
    }
    if (raw.tieneWifi === '1' || raw.tieneWifi === '0') {
      filtros.tieneWifi = Number(raw.tieneWifi);
    }
    if (raw.cantVehiculosParqueo !== null && raw.cantVehiculosParqueo !== '') {
      filtros.cantVehiculosParqueo = Number(raw.cantVehiculosParqueo);
    }
    if (raw.precioNoche !== null && raw.precioNoche !== '') {
      filtros.precioNoche = Number(raw.precioNoche);
    }

    this.lugaresService.buscarAvanzado(filtros).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigateByUrl('/resultados');
      },
      error: (err: Error) => {
        this.isLoading = false;
        this.errorMessage = err.message;
      },
    });
  }
}