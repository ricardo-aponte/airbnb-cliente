import type { Routes } from '@angular/router';

import { authGuard, guestGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./pages/auth/login/login.page').then((m) => m.LoginPage),
  },
  {
    path: 'registro',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./pages/auth/registro/registro.page').then((m) => m.RegistroPage),
  },
  {
    path: 'home',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/home/home.page').then((m) => m.HomePage),
  },
  {
    path: 'busqueda-avanzada',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/busqueda-avanzada/busqueda-avanzada.page').then(
        (m) => m.BusquedaAvanzadaPage
      ),
  },
  {
    path: 'resultados',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/resultados/resultados.page').then(
        (m) => m.ResultadosPage
      ),
  },
  {
    path: 'detalle-lugar/:id',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/detalle-lugar/detalle-lugar.page').then(
        (m) => m.DetalleLugarPage
      ),
  },
  {
    path: 'confirmar-reserva/:id',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/confirmar-reserva/confirmar-reserva.page').then(
        (m) => m.ConfirmarReservaPage
      ),
  },
  {
    path: 'mis-reservas',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/mis-reservas/mis-reservas.page').then(
        (m) => m.MisReservasPage
      ),
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: 'home',
  },
];