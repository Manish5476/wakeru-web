import { IUser } from './user.types';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface Session {
  token: string;
  device: string;
  ip: string;
  lastActive: string;
}

export interface AuthResult {
  user: IUser;
  tokens: TokenPair;
  isNewUser?: boolean;
}

export interface AuthState {
  user: IUser | null;
  tokens: TokenPair | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
