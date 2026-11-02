// Forme del marchio Frienzy (viewBox 0 0 512 512), usate sia dal componente React sia dallo script che genera le icone Android.
// Due fumetti che si sovrappongono (due amici che chiacchierano): davanti quello con la F, dietro quello con i tre puntini.
export const LOGO = {
  // Fumetto dietro, in basso a destra, con la coda.
  back: 'M322 210H368a52 52 0 0 1 52 52V298a52 52 0 0 1-52 52H388L408 394 350 350H322a52 52 0 0 1-52-52V262a52 52 0 0 1 52-52z',
  // Fumetto davanti, in alto a sinistra, con la coda in basso.
  front: 'M164 92H286a64 64 0 0 1 64 64V238a64 64 0 0 1-64 64H236L184 350V302H164a64 64 0 0 1-64-64V156a64 64 0 0 1 64-64z',
  // Lettera F disegnata a mano libera con soli segmenti.
  letter: 'M168 140H292V178H212V204H276V240H212V266H168Z',
  // Scintilla a quattro punte.
  spark: 'M372 92L382 118L408 128L382 138L372 164L362 138L336 128L362 118Z',
  // Tre puntini del "sta scrivendo" nel fumetto dietro: centri e raggio.
  dots: [[322, 326], [352, 326], [382, 326]] as const,
  dotRadius: 9,
} as const
