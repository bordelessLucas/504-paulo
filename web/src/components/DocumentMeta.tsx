import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

function upsertMeta(name: string, content: string) {
  let tag = document.head.querySelector(`meta[name="${name}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute('name', name);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
}

export function DocumentMeta() {
  const location = useLocation();

  useEffect(() => {
    const isPublicMarketing = location.pathname === '/';
    upsertMeta(
      'robots',
      isPublicMarketing ? 'index, follow' : 'noindex, nofollow',
    );
  }, [location.pathname]);

  return null;
}
