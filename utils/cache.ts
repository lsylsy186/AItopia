import { revalidateTag, unstable_cache } from 'next/cache';
import { getBlobPhotoUrls, getBlobUploadUrls } from '@/lib/blob';

const TAG_PHOTOS = 'photos';
const TAG_BLOB = 'blob';

export const revalidatePhotosTag = () =>
  revalidateTag(TAG_PHOTOS);

export const revalidateBlobTag = () =>
  revalidateTag(TAG_BLOB);

export const revalidatePhotosAndBlobTag = () => {
  revalidateTag(TAG_PHOTOS);
  revalidateTag(TAG_BLOB);
};

export const getBlobUploadUrlsCached: typeof getBlobUploadUrls = (...args) =>
  unstable_cache(
    () => getBlobUploadUrls(...args),
    [TAG_BLOB], {
    tags: [TAG_BLOB],
  }
  )();

export const getBlobPhotoUrlsCached: typeof getBlobPhotoUrls = (...args) =>
  unstable_cache(
    () => getBlobPhotoUrls(...args),
    [TAG_BLOB], {
    tags: [TAG_BLOB],
  }
  )();
