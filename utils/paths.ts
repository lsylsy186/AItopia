const PREFIX_TAG = '/t';
const PREFIX_API = '/api';

const SHARE = 'share';

export const PATH_ADMIN_PHOTOS = `${PREFIX_API}/photos`;
export const PATH_API_UPLOAD = `${PREFIX_API}/uploads`;
export const PATH_API_UPLOAD_BLOB_HANDLER = `${PATH_API_UPLOAD}/blob`;

export const pathForTag = (tag: string) => `${PREFIX_TAG}/${tag}`;

export const pathForTagShare = (tag: string) =>
  `${pathForTag(tag)}/${SHARE}`;

export const isPathPhoto = (pathname = '') =>
  /^\/p\/[^/]+\/?$/.test(pathname);

export const isPathPhotoShare = (pathname = '') =>
  /^\/p\/[^/]+\/share\/?$/.test(pathname);

export const isPathSignIn = (pathname = '') =>
  pathname.startsWith('/sign-in');

export const isPathProtected = (pathname = '') =>
  pathname.startsWith(PREFIX_API) ||
  pathname === '/checklist';
