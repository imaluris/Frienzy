export type ToastTone = 'info' | 'success' | 'warning'

export interface ToastMessage {
  id: number
  text: string
  tone: ToastTone
}

export const TOAST_MS = 2600
