// Indirizzo web pubblico dell'app (per i link da condividere). Si imposta con VITE_WEB_BASE_URL;
// il valore di riserva è un segnaposto da sostituire con l'indirizzo vero quando la pagina sarà pubblicata.
const FALLBACK_BASE = 'https://frienzy.example'

export function webBaseUrl(raw: string | undefined = import.meta.env.VITE_WEB_BASE_URL): string {
  const clean = (raw ?? '').trim().replace(/\/+$/, '')
  return /^https:\/\/[^\s/]+/.test(clean) ? clean : FALLBACK_BASE
}

/** Link a un evento: contiene solo l'id, mai la posizione. */
export function eventLink(eventId: string, base: string = webBaseUrl()): string {
  return `${base}/evento/${encodeURIComponent(eventId)}`
}
