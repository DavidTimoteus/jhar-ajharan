// Manajemen tema: default mengikuti sistem (prefers-color-scheme),
// bisa dioverride manual lewat localStorage 'ja-theme'.
export type ThemePref = 'system' | 'light' | 'dark';
export type ResolvedTheme = 'light' | 'dark';

const KEY = 'ja-theme';

export function readPref(): ThemePref {
  try {
    const v = localStorage.getItem(KEY);
    if (v === 'light' || v === 'dark' || v === 'system') return v;
  } catch {
    /* localStorage tidak tersedia */
  }
  return 'system';
}

export function systemTheme(): ResolvedTheme {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'light';
}

export function resolveTheme(pref: ThemePref): ResolvedTheme {
  return pref === 'system' ? systemTheme() : pref;
}

export function writePref(pref: ThemePref): void {
  try {
    localStorage.setItem(KEY, pref);
  } catch {
    /* abaikan */
  }
}

/** Terapkan atribut data-theme ke <html>; panggil saat init dan saat pref berubah. */
export function applyTheme(pref: ThemePref): ResolvedTheme {
  const resolved = resolveTheme(pref);
  document.documentElement.setAttribute('data-theme', resolved);
  return resolved;
}

/** Daftarkan listener perubahan tema sistem agar mode 'system' tetap mengikuti. */
export function watchSystemTheme(onChange: (resolved: ResolvedTheme) => void): () => void {
  if (typeof window === 'undefined' || !window.matchMedia) return () => {};
  const mq = window.matchMedia('(prefers-color-scheme: dark)');
  const handler = () => onChange(resolveTheme(readPref()));
  mq.addEventListener('change', handler);
  return () => mq.removeEventListener('change', handler);
}
