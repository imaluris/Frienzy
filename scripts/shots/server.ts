import { spawn, type ChildProcess } from 'node:child_process'

// Avvia Vite in modalità demo (servizi in memoria, nessun Firebase) e aspetta che risponda.
export async function startDemoServer(port: number): Promise<ChildProcess> {
  const child = spawn(process.execPath, ['node_modules/vite/bin/vite.js', '--port', String(port), '--strictPort'], {
    env: { ...process.env, VITE_DEMO: '1' },
    stdio: 'ignore',
  })
  const url = `http://localhost:${port}/`
  for (let i = 0; i < 60; i++) {
    try {
      if ((await fetch(url)).ok) return child
    } catch {
      /* il server non è ancora pronto */
    }
    await new Promise((r) => setTimeout(r, 500))
  }
  child.kill()
  throw new Error('Il server demo non è partito')
}
