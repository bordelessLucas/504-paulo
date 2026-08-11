import { PageHeader } from '../components/ui/PageHeader';
import { fetchHistoricoAvaliacoes } from '@/features/desempenho/historico-api';
import { HistoricoList } from './HistoricoList';
import { useAsyncData } from '../hooks/useAsyncData';
import page from '../styles/page.module.css';

export function HistoricoQuinzenalPage() {
  const { data, isLoading, error, reload } = useAsyncData(
    () => fetchHistoricoAvaliacoes('quinzenal'),
    [],
  );

  return (
    <div className={page.page}>
      <PageHeader
        title="Histórico de Avaliações – Quinzenal"
        description="Avaliações de bordo registradas no sistema."
      />
      <HistoricoList data={data} isLoading={isLoading} error={error} onRetry={reload} />
    </div>
  );
}
