import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonInput,
  IonButton,
  IonSpinner,
  IonText,
  IonButtons,
  IonBackButton,
} from '@ionic/angular';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonInput,
    IonButton,
    IonSpinner,
    IonText,
    IonButtons,
    IonBackButton,
  ],
  template: `
    <ion-header>
      <ion-toolbar color="danger">
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/login"></ion-back-button>
        </ion-buttons>
        <ion-title>Registro de Cliente</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div class="auth-container">
        <form [formGroup]="registroForm" (ngSubmit)="onSubmit()">
          <ion-input
            label="Nombre Completo"
            labelPlacement="floating"
            fill="outline"
            type="text"
            formControlName="nombrecompleto"
            class="ion-margin-bottom"
          ></ion-input>

          <ion-input
            label="Email"
            labelPlacement="floating"
            fill="outline"
            type="email"
            formControlName="email"
            class="ion-margin-bottom"
          ></ion-input>

          <ion-input
            label="Contraseña"
            labelPlacement="floating"
            fill="outline"
            type="password"
            formControlName="password"
            class="ion-margin-bottom"
          ></ion-input>

          <ion-input
            label="Teléfono"
            labelPlacement="floating"
            fill="outline"
            type="tel"
            formControlName="telefono"
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
            [disabled]="registroForm.invalid || isLoading"
            class="ion-margin-top"
          >
            @if (isLoading) {
              <ion-spinner name="crescent"></ion-spinner>
            } @else {
              Registrarse
            }
          </ion-button>

          <ion-button
            expand="block"
            fill="outline"
            color="danger"
            routerLink="/login"
            [disabled]="isLoading"
            class="ion-margin-top"
          >
            Iniciar Sesión
          </ion-button>
        </form>
      </div>
    </ion-content>
  `,
  styles: [
    `
      .auth-container {
        max-width: 420px;
        margin: 24px auto;
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
export class RegistroPage {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  isLoading = false;
  errorMessage = '';

  registroForm = this.fb.nonNullable.group({
    nombrecompleto: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(4)]],
    telefono: ['', [Validators.required]],
  });

  onSubmit(): void {
    if (this.registroForm.invalid) return;

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.registro(this.registroForm.getRawValue()).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigateByUrl('/home', { replaceUrl: true });
      },
      error: (err: Error) => {
        this.isLoading = false;
        this.errorMessage = err.message;
      },
    });
  }
}