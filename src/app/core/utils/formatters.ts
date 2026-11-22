export function toNumber(value: number | string | null | undefined, fallback = 0): number {
  if (value === null || value === undefined || value === '') return fallback;
  const parsed = typeof value === 'number' ? value : parseFloat(value);
  return isNaN(parsed) ? fallback : parsed;
}

export function calcularNoches(fechaInicio: string, fechaFin: string): number {
  if (!fechaInicio || !fechaFin) return 1;
  const inicio = new Date(fechaInicio);
  const fin = new Date(fechaFin);
  const diffMs = fin.getTime() - inicio.getTime();
  const dias = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  return dias > 0 ? dias : 1;
}

export function formatearFechaLatina(fechaIso: string): string {
  if (!fechaIso) return '';
  const soloFecha = fechaIso.split('T')[0];
  const partes = soloFecha.split('-');
  return partes.length === 3 ? `${partes[2]}/${partes[1]}/${partes[0]}` : fechaIso;
}