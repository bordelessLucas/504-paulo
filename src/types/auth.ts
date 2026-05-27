export type AuthUser = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
};

export type LoginCredentials = {
  email: string;
  password: string;
};

export type RegisterCredentials = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export type AuthError = {
  field?: keyof RegisterCredentials | keyof LoginCredentials | 'general';
  message: string;
};
