import type { IconName } from '../ui/Icon'

// Le voci del menu "Altre azioni": segnalare un evento, segnalare una persona, bloccare una persona.
export type SafetyOption =
  | { kind: 'report-event'; eventId: string }
  | { kind: 'report-user'; uid: string; nome: string }
  | { kind: 'block-user'; uid: string; nome: string }

export function optionLabel(option: SafetyOption): string {
  switch (option.kind) {
    case 'report-event': return 'Segnala questo evento'
    case 'report-user': return `Segnala ${option.nome}`
    case 'block-user': return `Blocca ${option.nome}`
  }
}

export function optionIcon(option: SafetyOption): IconName {
  return option.kind === 'block-user' ? 'user-x' : 'flag'
}

/** Voci per un evento: segnalarlo, e se so chi lo organizza (e non sono io) segnalare o bloccare lui. */
export function eventOptions(eventId: string, organizer: { uid: string; nome: string } | null, myUid: string): SafetyOption[] {
  const options: SafetyOption[] = [{ kind: 'report-event', eventId }]
  if (organizer && organizer.uid !== myUid) {
    options.push({ kind: 'report-user', uid: organizer.uid, nome: organizer.nome }, { kind: 'block-user', uid: organizer.uid, nome: organizer.nome })
  }
  return options
}

/** Voci per una persona dell'elenco "Chi c'è". */
export function personOptions(person: { uid: string; nome: string }): SafetyOption[] {
  return [{ kind: 'report-user', ...person }, { kind: 'block-user', ...person }]
}
