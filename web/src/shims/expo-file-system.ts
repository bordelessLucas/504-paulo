export const documentDirectory = '';
export const cacheDirectory = '';

export class File {
  uri: string;

  constructor(uri: string) {
    this.uri = uri;
  }

  async text(): Promise<string> {
    const response = await fetch(this.uri);
    if (!response.ok) {
      throw new Error('Não foi possível ler o arquivo.');
    }
    return response.text();
  }
}

export default { File, documentDirectory, cacheDirectory };
