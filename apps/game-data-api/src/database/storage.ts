/**
 * Singleton instance of JsonStorageService
 * All routes and repositories should use this shared instance
 */
import { JsonStorageService } from './json-storage.service';

// Singleton storage instance
let storageInstance: JsonStorageService | null = null;

/**
 * Get the shared storage instance
 */
export function getStorage(): JsonStorageService {
  if (!storageInstance) {
    storageInstance = new JsonStorageService();
  }
  return storageInstance;
}

/**
 * Reset storage instance (for testing)
 */
export function resetStorage(): void {
  storageInstance = null;
}

export default getStorage;
