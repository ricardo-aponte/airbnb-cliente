import type { Foto } from './foto.model';
import type { Usuario } from './usuario.model';

export interface Lugar {
  id: number;
  nombre: string;
  descripcion: string;
  cantPersonas: number;
  cantCamas: number;
  cantBanios: number;
  cantHabitaciones: number;
  tieneWifi: number; // 1 = sí, 0 = no
  cantVehiculosParqueo: number;
  precioNoche: string | number;
  costoLimpieza: string | number;
  ciudad: string;
  latitud: string | number;
  longitud: string | number;
  arrendatario_id: number;
  arrendatario?: Usuario;
  fotos?: Foto[];
  created_at?: string;
  updated_at?: string;
}