import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import type { PhotoStorage } from '../data/photoStorage'
import { storage } from './app'

// Scritto e compilato, ma mai eseguito di notte (serve un progetto Firebase vero).
export class FirebasePhotoStorage implements PhotoStorage {
  async upload(uid: string, file: Blob): Promise<string> {
    const fileRef = ref(storage(), `users/${uid}/profile`)
    await uploadBytes(fileRef, file)
    return getDownloadURL(fileRef)
  }
}
