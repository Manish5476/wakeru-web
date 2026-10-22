export type UserRole = 'TRAVELER' | 'VENDOR' | 'ADMIN';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  permissions: string[];
}

export interface AuthTokenPayload extends AuthUser {
  iat: number;
  exp: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    timestamp: string;
    requestId: string;
    userRole?: UserRole;
  };
}
