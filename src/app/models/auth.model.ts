export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  roles: string[];
}

export interface ApiError {
  errorCode: string;
  message: string;
}