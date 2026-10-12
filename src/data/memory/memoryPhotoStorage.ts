import type { PhotoStorage } from '../photoStorage'

// Finta archiviazione per i test: non salva nulla, restituisce solo un indirizzo https plausibile.
export class MemoryPhotoStorage implements PhotoStorage {
  async upload(uid: string): Promise<string> {
    return `https://photos.example.invalid/${uid}/profile.jpg`
  }
}
