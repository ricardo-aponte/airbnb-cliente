export interface Usuario {
  id: number;
  nombrecompleto: string;
  email: string;
  telefono: string;
  created_at?: string;
  updated_at?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegistroRequest {
  nombrecompleto: string;
  email: string;
  password: string;
  telefono: string;
}