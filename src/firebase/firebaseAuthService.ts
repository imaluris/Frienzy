import {
  createUserWithEmailAndPassword,
  deleteUser,
  EmailAuthProvider,
  reauthenticateWithCredential,
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

  // Firebase chiede un accesso recente prima di cancellare l'account: si rifà con la password.
  async reauthenticate(password: string): Promise<void> {
    const user = auth().currentUser
    if (!user?.email) throw Object.assign(new Error('auth/requires-recent-login'), { code: 'auth/requires-recent-login' })
    await reauthenticateWithCredential(user, EmailAuthProvider.credential(user.email, password))
  }

  async deleteAccount(): Promise<void> {
    const user = auth().currentUser
    if (!user) throw Object.assign(new Error('auth/requires-recent-login'), { code: 'auth/requires-recent-login' })
    await deleteUser(user)
  }

  currentUid(): string | null {
    return auth().currentUser?.uid ?? null
  }

  onChange(listener: (uid: string | null) => void): () => void {
    return onAuthStateChanged(auth(), (user) => listener(user?.uid ?? null))
  }
}
