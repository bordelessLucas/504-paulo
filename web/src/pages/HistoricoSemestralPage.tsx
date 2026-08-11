import { PageHeader } from '../components/ui/PageHeader';
import { fetchHistoricoAvaliacoes } from '@/features/desempenho/historico-api';
import { HistoricoList } from './HistoricoList';
import { useAsyncData } from '../hooks/useAsyncData';
import page from '../styles/page.module.css';

export function HistoricoSemestralPage() {
  const { data, isLoading, error, reload } = useAsyncData(
    () => fetchHistoricoAvaliacoes('semestral'),
    [],
  );

  return (
    <div className={page.page}>
      <PageHeader
        title="Histórico das Avaliações – Semestral"
        description="Consolidações semestrais para incentivos e cursos."
      />
      <HistoricoList data={data} isLoading={isLoading} error={error} onRetry={reload} />
    </div>
  );
}
