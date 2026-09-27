import { base44 } from "@/api/base44Client";

// Resolve a stored document reference to an accessible URL. New uploads are
// stored as private file URIs (via UploadPrivateFile) and need a short-lived
// signed URL to view; legacy documents stored as public URLs pass through.
export async function accessibleFileUrl(stored) {
  if (!stored) return null;
  if (/^https?:\/\//i.test(stored)) return stored;
  const { signed_url } = await base44.integrations.Core.CreateFileSignedUrl({ file_uri: stored });
  return signed_url;
}