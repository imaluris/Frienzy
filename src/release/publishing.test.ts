import { readFileSync } from 'node:fs'

// Controlli "di superficie" sulla preparazione alla pubblicazione (il workflow vero gira solo su GitHub):
// i segreti non devono mai stare nel repo, e le variabili usate da Gradle e dal workflow devono coincidere.
const gradle = readFileSync('android/app/build.gradle', 'utf8')
const workflow = readFileSync('docs/pubblicazione/android.workflow.yml', 'utf8')
const gitignore = readFileSync('.gitignore', 'utf8')
const guide = readFileSync('docs/pubblicazione.md', 'utf8')

const ENV_VARS = ['FRIENZY_KEYSTORE_PATH', 'FRIENZY_KEYSTORE_PASSWORD', 'FRIENZY_KEY_ALIAS', 'FRIENZY_KEY_PASSWORD']
const SECRETS = ['ANDROID_KEYSTORE_BASE64', 'ANDROID_KEYSTORE_PASSWORD', 'ANDROID_KEY_ALIAS', 'ANDROID_KEY_PASSWORD']

describe('firma di rilascio', () => {
  it('Gradle legge la firma dalle variabili d\'ambiente, mai da valori scritti', () => {
    for (const name of ENV_VARS) expect(gradle).toContain(`System.getenv('${name}')`)
    expect(gradle).not.toMatch(/storePassword\s+['"][^'"]+['"]/)
    expect(gradle).not.toMatch(/keyPassword\s+['"][^'"]+['"]/)
  })
  it('il rilascio è firmato solo se la chiave esiste', () => {
    expect(gradle).toContain('if (signingConfigs.release.storeFile != null)')
  })
  it('il workflow passa a Gradle le stesse variabili e legge i segreti con i nomi della guida', () => {
    for (const name of ENV_VARS) expect(workflow).toContain(`${name}:`)
    for (const name of SECRETS) {
      expect(workflow).toContain(`secrets.${name}`)
      expect(guide).toContain(name)
    }
  })
  it('le chiavi di firma sono ignorate da git', () => {
    for (const pattern of ['*.jks', '*.keystore', 'keystore.properties', '*.bundle']) expect(gitignore).toContain(pattern)
  })
})

describe('numero di versione automatico', () => {
  it('versionCode e versionName arrivano dai parametri, con valori di riserva', () => {
    expect(gradle).toContain("project.findProperty('versionCode')")
    expect(gradle).toContain("project.findProperty('versionName')")
  })
  it('il workflow usa il numero dell\'esecuzione e lo passa sia all\'APK sia all\'AAB', () => {
    expect(workflow).toContain('VERSION_CODE: ${{ github.run_number }}')
    expect(workflow.match(/-PversionCode=\$VERSION_CODE/g)).toHaveLength(2)
  })
})

describe('workflow di pubblicazione', () => {
  it('produce AAB firmato solo con i segreti, altrimenti resta l\'APK di debug', () => {
    expect(workflow).toContain('bundleRelease')
    expect(workflow).toContain('assembleDebug')
    expect(workflow).toContain("steps.firma.outputs.presente == 'true'")
  })
  it('non contiene segreti scritti (solo riferimenti a secrets.*)', () => {
    expect(workflow).not.toMatch(/-----BEGIN/)
    expect(workflow).not.toMatch(/PASSWORD:\s*[^$\s]/)
  })
  it('cancella la chiave dal runner alla fine', () => {
    expect(workflow).toContain('rm -f "$RUNNER_TEMP/frienzy-release.jks"')
  })
  it('mantiene la configurazione web di Firebase del workflow attuale', () => {
    const current = readFileSync('.github/workflows/android.yml', 'utf8')
    for (const line of current.split('\n').filter((l) => l.includes('VITE_FIREBASE_'))) expect(workflow).toContain(line.trim())
  })
})

describe('guida', () => {
  it('dice chiaramente che l\'account Play Console ha una tassa una tantum e spiega l\'APK senza store', () => {
    expect(guide).toMatch(/tassa di iscrizione una tantum/)
    expect(guide).toMatch(/senza Play Store/i)
  })
})
