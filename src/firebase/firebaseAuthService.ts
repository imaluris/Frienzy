import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth'
import type { AuthService } from '../auth/authService'
import { auth } from './app'

export class FirebaseAuthService implements AuthService {
  async register(email: string, password: string): Promise<string> {
    const credential = await createUserWithEmailAndPassword(auth(), email, password)
    return credential.user.uid
  }

  async login(email: string, password: string): Promise<string> {
    const credential = await signInWithEmailAndPassword(auth(), email, password)
    return credential.user.uid
  }

  logout(): Promise<void> {
    return signOut(auth())
  }

  currentUid(): string | null {
    return auth().currentUser?.uid ?? null
  }

  onChange(listener: (uid: string | null) => void): () => void {
    return onAuthStateChanged(auth(), (user) => listener(user?.uid ?? null))
  }
}
