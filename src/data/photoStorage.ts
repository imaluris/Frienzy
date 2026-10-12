// Contratto per caricare la foto profilo e ottenere il suo indirizzo https.
export interface PhotoStorage {
  upload(uid: string, file: Blob): Promise<string>
}
