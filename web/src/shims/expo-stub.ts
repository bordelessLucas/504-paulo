export default {};
export const File = class File {};
export const documentDirectory = '';
export const cacheDirectory = '';
export async function getDocumentAsync() {
  return { canceled: true, assets: [] };
}
export async function launchImageLibraryAsync() {
  return { canceled: true, assets: [] };
}
export async function requestMediaLibraryPermissionsAsync() {
  return { status: 'granted' };
}
export async function printToFileAsync() {
  return { uri: '' };
}
export async function shareAsync() {
  return undefined;
}
export function useFonts() {
  return [true, null];
}
