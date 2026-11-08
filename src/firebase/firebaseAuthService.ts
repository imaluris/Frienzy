import {
  createUserWithEmailAndPassword,
  deleteUser,
  EmailAuthProvider,
  reauthenticateWithCredential,
  onAuthStateChanged,
  sendEmailVerification,
  sendPasswordResetEmail,
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

  // Firebase manda l'email nella lingua del telefono; con "protezione enumerazione email" attiva (default dei
  // progetti nuovi) un indirizzo sconosciuto non dà errore, come vuole il contratto.
  async sendPasswordReset(email: string): Promise<void> {
    auth().languageCode = 'it'
    await sendPasswordResetEmail(auth(), email.trim())
  }

  async sendVerificationEmail(): Promise<void> {
    const user = auth().currentUser
    if (!user) throw Object.assign(new Error('auth/user-not-found'), { code: 'auth/user-not-found' })
    auth().languageCode = 'it'
    await sendEmailVerification(user)
  }

  // reload() chiede al server lo stato aggiornato: emailVerified non si aggiorna da solo.
  async isEmailVerified(): Promise<boolean> {
    const user = auth().currentUser
    if (!user) return false
    await user.reload()
    return user.emailVerified
  }

  currentUid(): string | null {
    return auth().currentUser?.uid ?? null
  }

  onChange(listener: (uid: string | null) => void): () => void {
    return onAuthStateChanged(auth(), (user) => listener(user?.uid ?? null))
  }
}
