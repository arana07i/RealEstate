'use client';

import { createContext, useContext, type ReactNode } from 'react';
import type { Agency } from '@/lib/types';

interface AgencyContextValue {
  agency: Agency | null;
  loading: boolean;
}

const AgencyContext = createContext<AgencyContextValue>({
  agency: null,
  loading: true,
});

export function AgencyProvider({ agency, children }: { agency: Agency | null; children: ReactNode }) {
  return (
    <AgencyContext.Provider value={{ agency, loading: false }}>
      {children}
    </AgencyContext.Provider>
  );
}

export function useAgency() {
  return useContext(AgencyContext);
}