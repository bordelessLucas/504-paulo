import type { ReactNode } from 'react';

import page from '../../styles/page.module.css';

type PageHeaderProps = {
  title: string;
  description?: string;
  accessory?: ReactNode;
};

export function PageHeader({ title, description, accessory }: PageHeaderProps) {
  return (
    <header className={page.pageHeader}>
      <div className={page.listItemHeader}>
        <h1 className={page.pageTitle}>{title}</h1>
        {accessory}
      </div>
      {description ? <p className={page.pageDescription}>{description}</p> : null}
    </header>
  );
}
