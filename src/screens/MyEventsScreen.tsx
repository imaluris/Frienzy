import { useState } from 'react'
import { useServices } from '../app/ServicesContext'
import { cancelEvent } from '../events/cancelEvent'
import { useMine } from '../mine/useMine'
import { useSaved } from '../saved/SavedContext'
import { withdrawFromEvent } from '../participation/withdrawFromEvent'
import { LoadFailed } from '../ui/LoadFailed'
import { PullToRefresh } from '../ui/PullToRefresh'
import { MineJoined } from './MineJoined'
import { MineOrganized } from './MineOrganized'
import { MineSaved } from './MineSaved'
import { MineTabs, type MineTab } from './MineTabs'

// "I miei eventi": tre schede (Organizzo, Iscrizioni, Salvati), con annullamento, ritiro e tira per aggiornare.
export function MyEventsScreen({ uid, onOpen }: { uid: string; onOpen: (eventId: string) => void }) {
  const services = useServices()
  const { loading, failed, mine, reload, refresh } = useMine(services, uid)
  const saved = useSaved()
  const [tab, setTab] = useState<MineTab>('organizzo')
  const [error, setError] = useState('')

  // Esegue l'azione, mostra il motivo se fallisce, poi rilegge le liste.
  async function run(action: () => Promise<unknown>) {
    setError('')
    try {
      await action()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Operazione non riuscita')
    }
    reload()
  }

  const counts = { organizzo: mine.organized.length, iscrizioni: mine.joined.length, salvati: saved.ids.length }
  const showEmpty = !loading && !failed

  return (
    <PullToRefresh onRefresh={async () => { saved.reload(); await refresh() }}>
      <section className="screen">
        <MineTabs active={tab} onSelect={setTab} counts={counts} />
        {tab !== 'salvati' && loading && <p className="loading">Caricamento…</p>}
        {tab !== 'salvati' && failed && <LoadFailed text="Non riesco a caricare i tuoi eventi." />}
        {error && <p role="alert" className="error">{error}</p>}
        {tab === 'organizzo' && (
          <MineOrganized events={mine.organized} showEmpty={showEmpty} onOpen={onOpen} onCancel={(id) => void run(() => cancelEvent(services.events, id, uid))} />
        )}
        {tab === 'iscrizioni' && (
          <MineJoined items={mine.joined} showEmpty={showEmpty} onOpen={onOpen} onWithdraw={(id) => void run(() => withdrawFromEvent(services.participations, id, uid))} />
        )}
        {tab === 'salvati' && <MineSaved onOpen={onOpen} />}
      </section>
    </PullToRefresh>
  )
}
