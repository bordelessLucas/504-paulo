/** Evita open redirect: só rotas internas relativas, sem protocolo ou host. */
export function isSafeInternalPath(value: unknown): value is string {
  if (typeof value !== 'string' || !value.startsWith('/')) {
    return false;
  }

  if (value.startsWith('//') || value.startsWith('/\\')) {
    return false;
  }

  if (value.includes('://') || value.includes('\\')) {
    return false;
  }

  return true;
}
