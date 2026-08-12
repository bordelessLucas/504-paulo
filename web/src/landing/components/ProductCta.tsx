import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

import type { ProductId } from '../data/products';
import { AVALIA_LOGIN_PATH, OPS_URL } from '../links';

type ProductCtaProps = {
  productId?: ProductId;
  href?: string;
  className?: string;
  children: ReactNode;
};

export default function ProductCta({ productId, href, className, children }: ProductCtaProps) {
  const isAvalia =
    productId === 'avalia' ||
    href === AVALIA_LOGIN_PATH ||
    href === '/register' ||
    (typeof href === 'string' && href.startsWith('/login'));

  if (isAvalia) {
    return (
      <Link className={className} to={href || AVALIA_LOGIN_PATH}>
        {children}
      </Link>
    );
  }

  return (
    <a className={className} href={href || OPS_URL} target="_blank" rel="noreferrer">
      {children}
    </a>
  );
}
