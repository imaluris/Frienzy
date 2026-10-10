import { doc, getDoc, setDoc } from 'firebase/firestore'
import type { UserRepository } from '../data/userRepository'
import type { UserProfile } from '../domain/user'
import { db } from './app'
import { userFromData, userToData } from './converters'

export class FirestoreUserRepository implements UserRepository {
  async save(profile: UserProfile): Promise<void> {
    await setDoc(doc(db(), 'users', profile.uid), userToData(profile))
  }

  async getById(uid: string): Promise<UserProfile | null> {
    const snap = await getDoc(doc(db(), 'users', uid))
    return snap.exists() ? userFromData(uid, snap.data()) : null
  }
}
