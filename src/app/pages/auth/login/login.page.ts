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
  IonIcon,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { homeOutline } from 'ionicons/icons';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-login',
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
    IonIcon,
  ],
  template: `
    <ion-header>
      <ion-toolbar color="danger">
        <ion-title>Cliente - Iniciar Sesión</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div class="auth-container">
        <div class="logo-box">
          <ion-icon name="home-outline" color="danger"></ion-icon>
          <h2>Bienvenido</h2>
          <p>Encuentra tu próximo alojamiento</p>
        </div>

        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
          <ion-input
            label="Email"
            labelPlacement="floating"
            fill="outline"
            type="email"
            formControlName="email"
            placeholder="correo@ejemplo.com"
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

          @if (errorMessage) {
            <div class="error-box ion-margin-bottom">
              <ion-text color="danger">{{ errorMessage }}</ion-text>
            </div>
          }

          <ion-button
            expand="block"
            color="danger"
            type="submit"
            [disabled]="loginForm.invalid || isLoading"
            class="ion-margin-top"
          >
            @if (isLoading) {
              <ion-spinner name="crescent"></ion-spinner>
            } @else {
              Iniciar Sesión
            }
          </ion-button>

          <ion-button
            expand="block"
            fill="outline"
            color="danger"
            routerLink="/registro"
            [disabled]="isLoading"
            class="ion-margin-top"
          >
            Registrarse
          </ion-button>
        </form>
      </div>
    </ion-content>
  `,
  styles: [
    `
      .auth-container {
        max-width: 420px;
        margin: 32px auto;
      }
      .logo-box {
        text-align: center;
        margin-bottom: 28px;
      }
      .logo-box ion-icon {
        font-size: 64px;
      }
      .logo-box h2 {
        margin: 8px 0 4px;
        font-weight: 700;
      }
      .logo-box p {
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
export class LoginPage {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  isLoading = false;
  errorMessage = '';

  loginForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  constructor() {
    addIcons({ homeOutline });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) return;

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login(this.loginForm.getRawValue()).subscribe({
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