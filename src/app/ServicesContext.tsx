import { createContext, useContext, type ReactNode } from 'react'
import type { Services } from '../firebase/createServices'

const ServicesContext = createContext<Services | null>(null)

// Rende i servizi (auth, repository) disponibili a tutte le schermate.
export function ServicesProvider({ services, children }: { services: Services; children: ReactNode }) {
  return <ServicesContext.Provider value={services}>{children}</ServicesContext.Provider>
}

export function useServices(): Services {
  const services = useContext(ServicesContext)
  if (!services) throw new Error('ServicesProvider mancante')
  return services
}
