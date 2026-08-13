import { useState } from 'react';

import Brand from './Brand';
import ProductCta from './ProductCta';

const navItems = [
  ['Institucional', '#institucional'],
  ['Soluções', '#solucoes'],
  ['Como atuamos', '#como-atuamos'],
  ['Capacidades', '#capacidades'],
  ['Contato', '#contato'],
] as const;

export default function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="header">
      <div className="header__inner container">
        <Brand compact />
        <nav className={`header__nav ${open ? 'is-open' : ''}`} aria-label="Navegação principal">
          {navItems.map(([label, href]) => (
            <a key={href} href={href} onClick={() => setOpen(false)}>
              {label}
            </a>
          ))}
        </nav>
        <ProductCta
          productId="avalia"
          href="/login"
          className="button button--small button--accent header__cta"
        >
          Entrar
        </ProductCta>
        <button
          className="menu-button"
          type="button"
          aria-label="Abrir menu"
          aria-expanded={open}
          onClick={() => setOpen(!open)}
        >
          <span></span>
          <span></span>
        </button>
      </div>
    </header>
  );
}
