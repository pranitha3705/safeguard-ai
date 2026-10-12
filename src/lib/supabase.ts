import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  '';

export const isSupabaseConfigured = (): boolean => {
  return (
    typeof supabaseUrl === 'string' &&
    supabaseUrl.length > 0 &&
    !supabaseUrl.includes('placeholder') &&
    typeof supabaseKey === 'string' &&
    supabaseKey.length > 0 &&
    !supabaseKey.includes('placeholder')
  );
};

// Create client or fallback safe dummy client
export const supabase: SupabaseClient = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : createClient('https://placeholder-project.supabase.co', 'placeholder-key-for-local-demo', {
      auth: {
        persistSession: false,
      },
    });

/**
 * Storage Helpers for the private 'evidence-vault' bucket
 */
export const STORAGE_BUCKET_NAME = 'evidence-vault';

export async function uploadEvidenceFile(
  userId: string,
  file: File,
  hash: string
): Promise<{ path: string; url?: string; error?: string }> {
  const extension = file.name.split('.').pop() || 'dat';
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const filePath = `${userId}/${Date.now()}_${hash.slice(0, 8)}_${sanitizedName}`;

  if (!isSupabaseConfigured()) {
    // Demo Mode: store in browser ObjectURL or simulated local path
    const localUrl = URL.createObjectURL(file);
    return { path: filePath, url: localUrl };
  }

  try {
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET_NAME)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      return { path: '', error: error.message };
    }

    // Since the bucket is private, generate a temporary signed URL (valid 1 hour)
    const { data: signedData, error: signedError } = await supabase.storage
      .from(STORAGE_BUCKET_NAME)
      .createSignedUrl(data.path, 3600);

    return {
      path: data.path,
      url: signedData?.signedUrl || undefined,
      error: signedError ? signedError.message : undefined,
    };
  } catch (err: any) {
    return { path: '', error: err?.message || 'Upload failed' };
  }
}

export async function getPrivateFileSignedUrl(path: string): Promise<string | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }
  try {
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET_NAME)
      .createSignedUrl(path, 3600);
    if (error || !data) return null;
    return data.signedUrl;
  } catch {
    return null;
  }
}

export async function deletePrivateFile(path: string): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured()) {
    return { success: true };
  }
  try {
    const { error } = await supabase.storage
      .from(STORAGE_BUCKET_NAME)
      .remove([path]);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Delete failed' };
  }
}
