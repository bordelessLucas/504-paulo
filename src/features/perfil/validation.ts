export type ChangePasswordInput = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

export type ChangePasswordFieldError = {
  field: keyof ChangePasswordInput | 'general';
  message: string;
};

export function validateChangePassword(
  input: ChangePasswordInput,
): ChangePasswordFieldError | null {
  if (!input.currentPassword) {
    return { field: 'currentPassword', message: 'Informe a senha atual.' };
  }

  if (!input.newPassword) {
    return { field: 'newPassword', message: 'Informe a nova senha.' };
  }

  if (input.newPassword.length < 6) {
    return { field: 'newPassword', message: 'A nova senha deve ter pelo menos 6 caracteres.' };
  }

  if (input.newPassword === input.currentPassword) {
    return { field: 'newPassword', message: 'A nova senha deve ser diferente da atual.' };
  }

  if (!input.confirmPassword) {
    return { field: 'confirmPassword', message: 'Confirme a nova senha.' };
  }

  if (input.newPassword !== input.confirmPassword) {
    return { field: 'confirmPassword', message: 'As senhas não coincidem.' };
  }

  return null;
}
