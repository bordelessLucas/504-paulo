const OPS_SITE = (
  import.meta.env.VITE_OPS_SITE_URL || 'https://vertek-505-paulo.netlify.app'
).replace(/\/$/, '');

/** Login do Vertek Ops (site irmão). */
export const OPS_URL =
  import.meta.env.VITE_OPS_URL || `${OPS_SITE}/app/login`;

export const OPS_SITE_URL = OPS_SITE;

/** Login interno do Vertek Avalia. */
export const AVALIA_LOGIN_PATH = '/login';
