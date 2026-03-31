'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';
import { T, type Lang } from '@/i18n/translations';

interface LangCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LangCtx>({
  lang: 'az',
  setLang: () => {},
  t: (key) => key,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>('az');

  function t(key: string, vars?: Record<string, string | number>): string {
    const entry = T[key];
    if (!entry) return key;
    let str = entry[lang] ?? entry['az'] ?? key;
    if (vars) {
      for (const [k, v] of Object.entries(vars)) {
        str = str.replace(`{${k}}`, String(v));
      }
    }
    return str;
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  return useContext(LanguageContext);
}
