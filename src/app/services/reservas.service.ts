import { HttpClient, type HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { type Observable, catchError, map, of, throwError } from 'rxjs';

import { API_CONFIG } from '../core/constants/api.constants';
import type { CrearReservaRequest, Reserva } from '../models/reserva.model';

@Injectable({
  providedIn: 'root',
})
export class ReservasService {
  private http = inject(HttpClient);

  crearReserva(payload: CrearReservaRequest): Observable<Reserva> {
    return this.http
      .post<Reserva>(`${API_CONFIG.baseUrl}/reservas`, payload)
      .pipe(catchError((error) => this.manejarError(error)));
  }

  getReservasPorCliente(clienteId: number): Observable<Reserva[]> {
    return this.http
      .get<Reserva[] | { reservas?: Reserva[] }>(
        `${API_CONFIG.baseUrl}/reservas/cliente/${clienteId}`
      )
      .pipe(
        map((resp) => {
          if (Array.isArray(resp)) return resp;
          if (resp && Array.isArray(resp.reservas)) return resp.reservas;
          return [];
        }),
        catchError((error: HttpErrorResponse) => {
          if (error.status === 404) {
            return of([]);
          }
          return this.manejarError(error);
        })
      );
  }

  private manejarError(error: HttpErrorResponse): Observable<never> {
    let mensaje = 'Error al procesar la reserva en el servidor.';

    if (error.error && typeof error.error === 'object') {
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