import { HttpClient, type HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { type Observable, catchError, tap, throwError } from 'rxjs';

import { API_CONFIG } from '../core/constants/api.constants';
import type {
  BusquedaAvanzadaRequest,
  EstadoBusqueda,
} from '../models/busqueda.model';
import type { Lugar } from '../models/lugar.model';

@Injectable({
  providedIn: 'root',
})
export class LugaresService {
  private http = inject(HttpClient);

  private readonly busquedaKey = 'estado_busqueda';
  private readonly resultadosKey = 'resultados_busqueda';

  private estadoBusqueda: EstadoBusqueda = this.crearEstadoPorDefecto();
  private resultados: Lugar[] = [];

  constructor() {
    this.cargarDesdeSession();
  }


  buscarSimple(ciudad: string): Observable<Lugar[]> {
    const body = ciudad.trim() ? { search: ciudad.trim() } : {};

    return this.http
      .post<Lugar[]>(`${API_CONFIG.baseUrl}/lugares/search`, body)
      .pipe(
        tap((lugares) => this.setResultados(lugares)),
        catchError((error) => this.manejarError(error))
      );
  }
  /**limpia los filtros y realiza una búsqueda avanzada (POST /api/lugares/advancedsearch). */
  buscarAvanzado(filtros: BusquedaAvanzadaRequest): Observable<Lugar[]> {
    const bodyLimpio: Record<string, string | number> = {};

    Object.entries(filtros).forEach(([clave, valor]) => {
      if (valor !== undefined && valor !== null && String(valor).trim() !== '') {
        bodyLimpio[clave] =
          typeof valor === 'string' ? valor.trim() : valor;
      }
    });

    return this.http
      .post<Lugar[]>(`${API_CONFIG.baseUrl}/lugares/advancedsearch`, bodyLimpio)
      .pipe(
        tap((lugares) => this.setResultados(lugares)),
        catchError((error) => this.manejarError(error))
      );
  }

  /** Obtiene el detalle completo de un lugar (GET /api/lugares/:id) */
  getLugarPorId(id: number): Observable<Lugar> {
    return this.http
      .get<Lugar>(`${API_CONFIG.baseUrl}/lugares/${id}`)
      .pipe(catchError((error) => this.manejarError(error)));
  }

  setEstadoBusqueda(estado: EstadoBusqueda): void {
    this.estadoBusqueda = { ...estado };
    sessionStorage.setItem(this.busquedaKey, JSON.stringify(this.estadoBusqueda));
  }

  getEstadoBusqueda(): EstadoBusqueda {
    return { ...this.estadoBusqueda };
  }

  setResultados(lugares: Lugar[]): void {
    this.resultados = lugares;
    sessionStorage.setItem(this.resultadosKey, JSON.stringify(lugares));
  }

  getResultados(): Lugar[] {
    return [...this.resultados];
  }

  limpiarEstado(): void {
    this.estadoBusqueda = this.crearEstadoPorDefecto();
    this.resultados = [];
    sessionStorage.removeItem(this.busquedaKey);
    sessionStorage.removeItem(this.resultadosKey);
  }

  private cargarDesdeSession(): void {
    try {
      const savedBusqueda = sessionStorage.getItem(this.busquedaKey);
      if (savedBusqueda) {
        this.estadoBusqueda = JSON.parse(savedBusqueda) as EstadoBusqueda;
      }

      const savedResultados = sessionStorage.getItem(this.resultadosKey);
      if (savedResultados) {
        this.resultados = JSON.parse(savedResultados) as Lugar[];
      }
    } catch {
      this.estadoBusqueda = this.crearEstadoPorDefecto();
      this.resultados = [];
    }
  }

  private crearEstadoPorDefecto(): EstadoBusqueda {
    const hoy = new Date();
    const manana = new Date(hoy);
    manana.setDate(hoy.getDate() + 1);

    return {
      ciudad: '',
      fechaInicio: hoy.toISOString().split('T')[0],
      fechaFin: manana.toISOString().split('T')[0],
      cantPersonas: 1,
    };
  }

  private manejarError(error: HttpErrorResponse): Observable<never> {
    let mensaje = 'Error al buscar alojamientos en el servidor.';

    if (error.error && typeof error.error === 'object') {
      if (error.error.message) {
        mensaje = String(error.error.message);
      } else {
        const valores = Object.values(error.error);
        if (valores.length > 0 && Array.isArray(valores[0]) && valores[0].length > 0) {
          mensaje = String(valores[0][0]);
        }
      }
    }

    return throwError(() => new Error(mensaje));
  }
}