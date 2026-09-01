export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  roles: string[];
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  roles: string[];
}

export interface RegisterResponse {
  id: number;
  username: string;
  email: string;
  enabled: boolean;
  roles: string[];
}

export interface ApiError {
  errorCode: string;
  message: string;
}