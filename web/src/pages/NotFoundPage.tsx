import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

import { Button } from '../components/ui/Button';
import page from '../styles/page.module.css';

export function NotFoundPage() {
  return (
    <div className={page.page}>
      <div className={page.notFound}>
        <p className={page.notFoundCode}>404</p>
        <h1 className={page.pageTitle}>Página não encontrada</h1>
        <p className={page.pageDescription}>
          A rota acessada não existe ou foi movida.
        </p>
        <div className={page.actions} style={{ justifyContent: 'center', marginTop: '1.5rem' }}>
          <Link to="/">
            <Button leftIcon={<Home size={16} />}>Ir para início</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
