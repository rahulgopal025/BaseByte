import { createContext, useContext, useState, ReactNode } from 'react';

interface BreadcrumbContextType {
  customBreadcrumbs: Record<string, string>;
  setCustomBreadcrumb: (pathId: string, title: string) => void;
}

const BreadcrumbContext = createContext<BreadcrumbContextType | undefined>(undefined);

export function BreadcrumbProvider({ children }: { children: ReactNode }) {
  const [customBreadcrumbs, setCustomBreadcrumbs] = useState<Record<string, string>>({});

  const setCustomBreadcrumb = (pathId: string, title: string) => {
    setCustomBreadcrumbs(prev => {
      if (prev[pathId] === title) return prev;
      return { ...prev, [pathId]: title };
    });
  };

  return (
    <BreadcrumbContext.Provider value={{ customBreadcrumbs, setCustomBreadcrumb }}>
      {children}
    </BreadcrumbContext.Provider>
  );
}

export function useBreadcrumbs() {
  const context = useContext(BreadcrumbContext);
  if (context === undefined) {
    throw new Error('useBreadcrumbs must be used within a BreadcrumbProvider');
  }
  return context;
}
