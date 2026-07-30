export async function printToFileAsync(options?: { html?: string }): Promise<{ uri: string }> {
  const html = options?.html ?? '';
  const printWindow = window.open('', '_blank', 'noopener,noreferrer,width=900,height=700');
  if (!printWindow) {
    throw new Error('Pop-up bloqueado. Permita janelas pop-up para imprimir.');
  }
  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
  setTimeout(() => {
    printWindow.focus();
    printWindow.print();
  }, 250);
  return { uri: 'about:blank' };
}

export default { printToFileAsync };
