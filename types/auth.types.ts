export interface User {
  id: number;
  name: string;
  email: string;
  bio?: string;
  avatar_url?: string;
  role: 'guest' | 'user' | 'admin';
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: string[];
}
