import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';

export const AUDIO_BUCKET = 'bible-audio';
export const DEFAULT_TTL_DAYS = 20;

export function getTtlDays(): number {
  const raw = Number(Deno.env.get('AUDIO_CACHE_TTL_DAYS') || DEFAULT_TTL_DAYS);
  return Number.isFinite(raw) && raw > 0 ? raw : DEFAULT_TTL_DAYS;
}

/**
 * Remove arquivos de áudio e registros de cache sem acesso há mais de `ttlDays` dias.
 */
export async function purgeExpiredAudioCache(
  admin: SupabaseClient,
  ttlDays = getTtlDays(),
  limit = 50
): Promise<number> {
  const cutoffIso = new Date(Date.now() - ttlDays * 24 * 60 * 60 * 1000).toISOString();

  const { data: expired, error } = await admin
    .from('bible_audio_cache')
    .select('cache_key, file_path')
    .lt('last_accessed_at', cutoffIso)
    .limit(limit);

  if (error || !expired || expired.length === 0) {
    return 0;
  }

  const paths = expired.map((row) => row.file_path).filter(Boolean);
  if (paths.length > 0) {
    await admin.storage.from(AUDIO_BUCKET).remove(paths);
  }

  const keys = expired.map((row) => row.cache_key);
  await admin.from('bible_audio_cache').delete().in('cache_key', keys);

  return keys.length;
}
