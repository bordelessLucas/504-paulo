import { useEffect } from 'react';

import { LandingShell } from '../landing/LandingShell';

export function LandingPage() {
  useEffect(() => {
    const root = document.documentElement;
    const previousTitle = document.title;
    root.classList.add('landing-page');
    document.title = 'VERTEK — Ops e Avalia | Tecnologia institucional';
    return () => {
      root.classList.remove('landing-page');
      document.title = previousTitle;
    };
  }, []);

  return <LandingShell />;
}
