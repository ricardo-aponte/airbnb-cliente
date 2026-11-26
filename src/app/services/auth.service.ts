import { HttpClient, type HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { type Observable, tap, catchError, throwError } from 'rxjs';

import { API_CONFIG } from '../core/constants/api.constants';
import type {
  LoginRequest,
  RegistroRequest,
  Usuario,
} from '../models/usuario.model';

import { LugaresService } from './lugares.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private lugaresService = inject(LugaresService);
  private readonly storageKey = 'cliente_session';

  login(credentials: LoginRequest): Observable<Usuario> {
    return this.http
      .post<Usuario>(`${API_CONFIG.baseUrl}/cliente/login`, {
        email: credentials.email.trim(),
        password: credentials.password,
      })
      .pipe(
        tap((usuario) => this.guardarSesion(usuario)),
        catchError((error) => this.manejarError(error))
      );
  }

  registro(data: RegistroRequest): Observable<Usuario> {
    return this.http
      .post<Usuario>(`${API_CONFIG.baseUrl}/cliente/registro`, {
        nombrecompleto: data.nombrecompleto.trim(),
        email: data.email.trim(),
        password: data.password,
        telefono: data.telefono.trim(),
      })
      .pipe(
        tap((usuario) => this.guardarSesion(usuario)),
        catchError((error) => this.manejarError(error))
      );
  }

  guardarSesion(usuario: Usuario): void {
    localStorage.setItem(this.storageKey, JSON.stringify(usuario));
    this.lugaresService.limpiarEstado();
  }

  getUsuarioActual(): Usuario | null {
    const raw = localStorage.getItem(this.storageKey);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as Usuario;
    } catch {
      return null;
    }
  }

  isAuthenticated(): boolean {
    return this.getUsuarioActual() !== null;
  }

  logout(): void {
    localStorage.removeItem(this.storageKey);
    this.lugaresService.limpiarEstado();
  }

private manejarError(error: HttpErrorResponse): Observable<never> {
    let mensaje = 'Error de conexión con el servidor.';

    if (error.status === 401) {
      mensaje = 'Correo o contraseña incorrectos.';
    } else if (error.status === 500) {
      mensaje =
        'El correo electrónico ya está registrado o hubo un error en el servidor.';
    } else if (typeof error.error === 'string' && error.error.trim()) {
      mensaje = error.error;
    } else if (error.error && typeof error.error === 'object') {
      if (error.error.message) {
        mensaje = String(error.error.message);
      } else {
        const valores = Object.values(error.error);
        if (
          valores.length > 0 &&
          Array.isArray(valores[0]) &&
          valores[0].length > 0
        ) {
          mensaje = String(valores[0][0]);
        }
      }
    }

    return throwError(() => new Error(mensaje));
  }
}