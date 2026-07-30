export async function isAvailableAsync(): Promise<boolean> {
  return typeof navigator !== 'undefined' && typeof navigator.share === 'function';
}

export async function shareAsync(
  url: string,
  options?: { mimeType?: string; dialogTitle?: string; UTI?: string },
): Promise<void> {
  if (typeof navigator.share === 'function') {
    await navigator.share({
      title: options?.dialogTitle ?? 'Vertek Avalia',
      url,
    });
    return;
  }

  if (typeof navigator.clipboard?.writeText === 'function') {
    await navigator.clipboard.writeText(url);
    return;
  }

  throw new Error('Compartilhamento não disponível neste navegador.');
}

export default { isAvailableAsync, shareAsync };
