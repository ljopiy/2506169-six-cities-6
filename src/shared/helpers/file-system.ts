import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
import { unlink } from 'node:fs/promises';

export function getCurrentModuleDirectoryPath(): string {
  const modulePath = fileURLToPath(import.meta.url);
  return dirname(modulePath);
}

export async function removeFileIfExists(filePath?: string): Promise<boolean> {
  if (!filePath) {
    return false;
  }

  try {
    await unlink(filePath);
    return true;
  } catch {
    return false;
  }
}
