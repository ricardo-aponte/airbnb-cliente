export interface EstadoBusqueda {
  ciudad: string;
  fechaInicio: string; // YYYY-MM-DD
  fechaFin: string;    // YYYY-MM-DD
  cantPersonas: number;
}

export interface BusquedaAvanzadaRequest {
  ciudad: string;
  nombre?: string;
  descripcion?: string;
  cantPersonas?: number;
  cantCamas?: number;
  cantBanios?: number;
  cantHabitaciones?: number;
  tieneWifi?: number;
  cantVehiculosParqueo?: number;
  precioNoche?: number;
}