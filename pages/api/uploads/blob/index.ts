import { revalidatePhotosAndBlobTag } from '@/utils/cache';
import {
  ACCEPTED_PHOTO_FILE_TYPES,
  isUploadPathnameValid,
} from '@/lib/blob';
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';

export const config = {
  runtime: 'edge',
};

const handler = async (request: Request): Promise<Response> => {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        if (isUploadPathnameValid(pathname)) {
          return {
            maximumSizeInBytes: 40_000_000,
            allowedContentTypes: ACCEPTED_PHOTO_FILE_TYPES,
          };
        } else {
          throw new Error('Invalid upload');
        }
      },
      onUploadCompleted: async () => {
        // revalidatePhotosAndBlobTag();
      },
    });
    // revalidatePhotosAndBlobTag();
    return new Response(JSON.stringify(jsonResponse));
  } catch (error) {
    // revalidatePhotosAndBlobTag();
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 400 },
    );
  }
}

export default handler;

