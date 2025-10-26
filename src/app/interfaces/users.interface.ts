export interface Users {
    id: string
    email: string
    password: string
    nombres: string
    apellidos: string
    cedula: string
    fechaNacimiento: string
    isAdmin: boolean
    lastDocumentCheck: { [key: string]: number }
}

export interface UserSession {
    email: string;
    isAdmin: boolean;
    cedula: string;
    nombre: string;
    apellido: string;
    lastLogin: string;
    lastDocumentCheck: { [key: string]: number }
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  success: boolean
  message: string
  user?: UserSession
}
