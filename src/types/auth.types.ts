export interface User {
  userId: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  roles: string[];
}

export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  permissions: string[];
  isAuthenticated: boolean;
}

export interface LoginRequest {
  username: string;
  password: string;
}

// Backend response from /rest/auth/token
export interface BackendTokenResponse {
  statusCode: number;
  statusDescription: string;
  successMessage: string;
  data: {
    access_token: string;
    refresh_token: string;
    token_type: string;
    expires_in: string;
  };
}

export interface JWTPayload {
  iat: number;
  exp: number;
  iss: string;
  userLoginId: string;
}

export interface LoginResponse {
  token: string;
  refreshToken: string;
  user: User;
  permissions: string[];
}
