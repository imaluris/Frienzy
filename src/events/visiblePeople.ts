// "Chi c'è" con tante persone: se sono più di PEOPLE_PREVIEW se ne mostrano solo le prime, il resto dietro "Mostra tutti".
export const PEOPLE_PREVIEW = 6

export function visiblePeople<T>(people: T[], expanded: boolean): { shown: T[]; hidden: number } {
  if (expanded || people.length <= PEOPLE_PREVIEW) return { shown: people, hidden: 0 }
  return { shown: people.slice(0, PEOPLE_PREVIEW), hidden: people.length - PEOPLE_PREVIEW }
}
