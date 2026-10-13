import { defineConfig } from 'vitest/config'

// Configurazione SOLO per i test delle regole (servono l'emulatore Firestore e Java).
// Si lanciano con `npm run test:rules`, non fanno parte di `npm test`.
export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    include: ['rules-tests/**/*.rules-test.ts'],
    fileParallelism: false,
  },
})
