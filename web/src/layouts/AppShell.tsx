import { Flag, Menu, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';

import { useAuth } from '@/features/auth/auth-context';
import {
  getMenuSectionsForRole,
  getPrimaryTabForRole,
  getTabLabelForRole,
  ROLE_LABELS,
} from '@/navigation/role-menus';
import type { UserRole } from '@/types/supabase';

import { getMenuIcon } from '../navigation/menu-icons';
import { getTabPath } from '../navigation/routes';
import styles from './AppShell.module.css';

type ExtraLink = {
  path: string;
  label: string;
};

function getPdiLinksForRole(role: UserRole): ExtraLink[] {
  switch (role) {
    case 'colaborador':
      return [{ path: '/app/pdi', label: 'Meus PDIs' }];
    case 'supervisor':
    case 'gestor':
    case 'gerente':
      return [{ path: '/app/pdi-equipe', label: 'PDI da equipe' }];
    case 'rh':
    case 'ceo':
    case 'admin':
      return [
        { path: '/app/pdi-equipe', label: 'PDI da equipe' },
        { path: '/app/pdi', label: 'PDIs' },
      ];
    default:
      return [];
  }
}

export function AppShell() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const role = (user?.role ?? 'colaborador') as UserRole;
  const sections = useMemo(() => getMenuSectionsForRole(role), [role]);
  const pdiLinks = useMemo(() => getPdiLinksForRole(role), [role]);

  return (
    <div className={styles.shell}>
      <aside className={`${styles.sidebar} ${isMobileOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.brand}>
          <span className={styles.brandMark}>VA</span>
          <div>
            <strong>Vertek Avalia</strong>
            <p>{ROLE_LABELS[role]}</p>
          </div>
          <button
            type="button"
            className={styles.closeMobile}
            onClick={() => setIsMobileOpen(false)}
            aria-label="Fechar menu"
          >
            <X size={18} />
          </button>
        </div>

        <nav className={styles.nav}>
          {sections.map((section) => (
            <div key={section.title} className={styles.section}>
              <p className={styles.sectionTitle}>{section.title}</p>
              {section.items.map((item) => {
                const Icon = getMenuIcon(item.icon);
                return (
                  <NavLink
                    key={item.name}
                    to={getTabPath(item.name)}
                    className={({ isActive }) =>
                      `${styles.link} ${isActive ? styles.linkActive : ''}`
                    }
                    onClick={() => setIsMobileOpen(false)}
                  >
                    <Icon size={18} />
                    <span>{getTabLabelForRole(item.name, role)}</span>
                  </NavLink>
                );
              })}
            </div>
          ))}

          {pdiLinks.length > 0 ? (
            <div className={styles.section}>
              <p className={styles.sectionTitle}>Desenvolvimento</p>
              {pdiLinks.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  className={({ isActive }) =>
                    `${styles.link} ${isActive ? styles.linkActive : ''}`
                  }
                  onClick={() => setIsMobileOpen(false)}
                >
                  <Flag size={18} />
                  <span>{link.label}</span>
                </NavLink>
              ))}
            </div>
          ) : null}
        </nav>

        <div className={styles.footer}>
          <p className={styles.userName}>{user?.name}</p>
          <button
            type="button"
            className={styles.signOut}
            onClick={async () => {
              await signOut();
              navigate('/login', { replace: true });
            }}
          >
            Sair
          </button>
        </div>
      </aside>

      {isMobileOpen ? (
        <button
          type="button"
          className={styles.backdrop}
          aria-label="Fechar menu"
          onClick={() => setIsMobileOpen(false)}
        />
      ) : null}

      <div className={styles.main}>
        <header className={styles.topbar}>
          <button
            type="button"
            className={styles.menuButton}
            onClick={() => setIsMobileOpen(true)}
            aria-label="Abrir menu"
          >
            <Menu size={20} />
          </button>
          <button
            type="button"
            className={styles.homeChip}
            onClick={() => navigate(getTabPath(getPrimaryTabForRole(role)))}
          >
            Início
          </button>
        </header>
        <main className={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
