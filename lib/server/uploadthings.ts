import { UTApi } from 'uploadthing/server';

export const utapi = new UTApi();

/**
 * Convertit un nom de fichier en ASCII pur.
 * UploadThing place le nom dans un en-tête HTTP (ByteString, chars 0-255) :
 * les accents, puces et autres caractères Unicode le font planter.
 */
export function toAsciiFileName(name: string): string {
  const dot = name.lastIndexOf('.');
  const ext = dot >= 0 ? name.slice(dot + 1).replace(/[^a-zA-Z0-9]/g, '') : '';
  const base = dot >= 0 ? name.slice(0, dot) : name;
  const cleanBase =
    base
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '') // retire les accents
      .replace(/[^a-zA-Z0-9._-]/g, '_') // remplace tout le reste
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '') || 'fichier';
  return ext ? `${cleanBase}.${ext}` : cleanBase;
}

/** Renvoie une copie du fichier avec un nom ASCII sûr pour UploadThing. */
export function toSafeFile(file: File): File {
  return new File([file], toAsciiFileName(file.name), { type: file.type });
}
