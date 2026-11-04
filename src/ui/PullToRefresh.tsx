import type { ReactNode } from 'react'
import { Icon } from './Icon'
import { PULL_THRESHOLD } from './pullState'
import { usePullToRefresh } from './usePullToRefresh'

// Contenitore "tira per aggiornare": il contenuto scende seguendo il dito e compare un cerchio con la freccia.
export function PullToRefresh({ onRefresh, children }: { onRefresh: () => Promise<unknown>; children: ReactNode }) {
  const { pull, refreshing, handlers } = usePullToRefresh(onRefresh)
  const ready = pull >= PULL_THRESHOLD
  return (
    <div className="pull" {...handlers}>
      <div
        className={`pull-indicator${refreshing ? ' is-refreshing' : ''}${ready ? ' is-ready' : ''}`}
        style={{ transform: `translateY(${pull - 56}px)`, opacity: Math.min(1, pull / PULL_THRESHOLD) }}
        role="status"
        aria-live="polite"
        aria-label={refreshing ? 'Aggiornamento in corso' : undefined}
      >
        <Icon name="refresh" size={20} />
      </div>
      <div className="pull-content" style={{ transform: pull > 0 ? `translateY(${pull}px)` : undefined }}>{children}</div>
    </div>
  )
}
