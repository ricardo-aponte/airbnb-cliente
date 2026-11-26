import type { Lugar } from './lugar.model';
import type { Usuario } from './usuario.model';

export interface CrearReservaRequest {
  lugar_id: number;
  cliente_id: number;
  fechaInicio: string; // Formato YYYY-MM-DD
  fechaFin: string;    // Formato YYYY-MM-DD
  precioNoches: number;
  precioLimpieza: number;
  precioServicio: number;
  precioTotal: number;
}

export interface Reserva {
  id: number;
  fechaInicio: string;
  fechaFin: string;
  precioTotal: string | number;
  precioLimpieza: string | number;
  precioNoches: string | number;
  precioServicio: string | number;
  cliente?: Usuario;
  lugar?: Lugar[]; // En GET /reservas/cliente/:id el backend devuelve un arreglo
  created_at?: string;
  updated_at?: string;
}