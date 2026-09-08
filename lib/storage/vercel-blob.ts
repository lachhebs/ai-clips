import { put, del, head } from "@vercel/blob";

export async function uploadToBlob(
  filename: string,
  data: Buffer | ReadableStream,
  contentType?: string
): Promise<{ url: string; pathname: string }> {
  const blob = await put(filename, data, {
    access: "public",
    contentType,
  });
  return { url: blob.url, pathname: blob.pathname };
}

export async function deleteFromBlob(url: string): Promise<void> {
  await del(url);
}

export async function getBlobInfo(url: string) {
  return head(url);
}
