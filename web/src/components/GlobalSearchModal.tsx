import { Search, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { searchPeople, type GlobalPersonResult } from '@/features/search/global-search-api';
import { canAccessTab, getTabsForRole, type TabMenuItem } from '@/navigation/role-menus';
import type { UserRole } from '@/types/supabase';

import { getTabPath } from '../navigation/routes';
import styles from './GlobalSearchModal.module.css';

type SearchResult =
  | { key: string; kind: 'page'; page: TabMenuItem }
  | { key: string; kind: 'person'; person: GlobalPersonResult };

function normalize(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR');
}

type Props = {
  open: boolean;
  onClose: () => void;
  role: UserRole;
};

export function GlobalSearchModal({ open, onClose, role }: Props) {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const requestIdRef = useRef(0);
  const [query, setQuery] = useState('');
  const [people, setPeople] = useState<GlobalPersonResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const canSearchPeople = canAccessTab(role, 'RelatorioIndividual');

  const pages = useMemo(() => {
    const term = normalize(query.trim());
    const available = getTabsForRole(role);
    return term ? available.filter((page) => normalize(page.label).includes(term)) : available.slice(0, 6);
  }, [query, role]);

  const results = useMemo<SearchResult[]>(
    () => [
      ...pages.map((page) => ({ key: `page-${page.name}`, kind: 'page' as const, page })),
      ...people.map((person) => ({ key: `person-${person.id}`, kind: 'person' as const, person })),
    ],
    [pages, people],
  );

  useEffect(() => {
    if (!open) {
      setQuery('');
      setPeople([]);
      setError(null);
      return;
    }
    const timer = window.setTimeout(() => inputRef.current?.focus(), 80);
    return () => window.clearTimeout(timer);
  }, [open]);

  useEffect(() => {
    const term = query.trim();
    const requestId = ++requestIdRef.current;
    if (!open || !canSearchPeople || term.length < 2) {
      setPeople([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    const timer = window.setTimeout(() => {
      void searchPeople(term)
        .then((data) => {
          if (requestId === requestIdRef.current) setPeople(data);
        })
        .catch((reason: unknown) => {
          if (requestId === requestIdRef.current) {
            setPeople([]);
            setError(reason instanceof Error ? reason.message : 'Falha ao pesquisar.');
          }
        })
        .finally(() => {
          if (requestId === requestIdRef.current) setIsLoading(false);
        });
    }, 350);

    return () => window.clearTimeout(timer);
  }, [canSearchPeople, open, query]);

  if (!open) return null;

  function goToResult(result: SearchResult) {
    if (result.kind === 'page') {
      navigate(getTabPath(result.page.name));
    } else {
      navigate(`${getTabPath('RelatorioIndividual')}?colaborador=${result.person.id}`);
    }
    onClose();
  }

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-label="Busca global">
      <button type="button" className={styles.backdrop} aria-label="Fechar busca" onClick={onClose} />
      <div className={styles.panel}>
        <div className={styles.header}>
          <Search size={18} />
          <input
            ref={inputRef}
            className={styles.input}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar página ou colaborador..."
            aria-label="Buscar"
          />
          <button type="button" className={styles.close} onClick={onClose} aria-label="Fechar">
            <X size={18} />
          </button>
        </div>
        <div className={styles.body}>
          {isLoading ? <p className={styles.meta}>Pesquisando...</p> : null}
          {error ? <p className={styles.error}>{error}</p> : null}
          {results.length === 0 && !isLoading ? (
            <p className={styles.meta}>Nenhum resultado.</p>
          ) : (
            <ul className={styles.list}>
              {results.map((result) => (
                <li key={result.key}>
                  <button type="button" className={styles.item} onClick={() => goToResult(result)}>
                    <span className={styles.kind}>{result.kind === 'page' ? 'Página' : 'Pessoa'}</span>
                    <strong>
                      {result.kind === 'page' ? result.page.label : result.person.nome}
                    </strong>
                    {result.kind === 'person' ? (
                      <span className={styles.meta}>
                        {[result.person.funcao, result.person.departamento, result.person.codigoInterno]
                          .filter(Boolean)
                          .join(' · ')}
                      </span>
                    ) : null}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
