import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

import type { ProductId } from '../data/products';
import { AVALIA_LOGIN_PATH, OPS_SITE_URL, OPS_URL } from '../links';

type ProductCtaProps = {
  productId?: ProductId;
  href?: string;
  className?: string;
  children: ReactNode;
};

function isInternalPath(href: string): boolean {
  return href.startsWith('/') && !href.startsWith('//');
}

function isLoginPath(href: string): boolean {
  return href === AVALIA_LOGIN_PATH || href.startsWith('/login') || href.includes('/app/login');
}

export default function ProductCta({ productId, href, className, children }: ProductCtaProps) {
  const resolved =
    href ||
    (productId === 'avalia' ? '/' : productId === 'ops' ? OPS_SITE_URL : '/');

  if (isInternalPath(resolved)) {
    return (
      <Link className={className} to={resolved}>
        {children}
      </Link>
    );
  }

  const isOpsLogin = productId === 'ops' && isLoginPath(resolved);
  return (
    <a
      className={className}
      href={isOpsLogin ? OPS_URL : resolved}
      target="_blank"
      rel="noopener noreferrer"
      referrerPolicy="strict-origin-when-cross-origin"
    >
      {children}
    </a>
  );
}
