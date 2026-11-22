import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonButton,
  IonIcon,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { logOutOutline } from 'ionicons/icons';
import { AuthService } from '../../services/auth.service';
import { Usuario } from '../../models/usuario.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButtons,
    IonButton,
    IonIcon,
  ],
  template: `
    <ion-header>
      <ion-toolbar color="danger">
        <ion-title>Buscar Alojamientos</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="cerrarSesion()">
            <ion-icon slot="icon-only" name="log-out-outline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div class="welcome-box">
        <h2>Hola, {{ usuario?.nombrecompleto }}</h2>
        <p>ID de Cliente: {{ usuario?.id }}</p>
        <p>Email: {{ usuario?.email }}</p>
      </div>
    </ion-content>
  `,
  styles: [
    `
      .welcome-box {
        text-align: center;
        margin-top: 64px;
      }
    `,
  ],
})
export class HomePage {
  private authService = inject(AuthService);
  private router = inject(Router);

  usuario: Usuario | null = this.authService.getUsuarioActual();

  constructor() {
    addIcons({ logOutOutline });
  }

  cerrarSesion(): void {
    this.authService.logout();
    this.router.navigateByUrl('/login', { replaceUrl: true });
  }
}