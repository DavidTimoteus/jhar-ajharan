// Pembersih teks tampilan & detektor kebocoran tag HTML / sintaks rumus mentah.
// Menjaga operator matematika seperti "a < b" atau "x < 5" agar tetap utuh.

// Memerlukan format tag HTML valid (</tag>, <tag>, atau <tag attr="...">),
// sehingga pertidaksamaan matematika seperti "a<b atau b>a" tidak pernah dianggap tag HTML.
const HTML_TAG_RE =
  /<\/?(?:p|div|br|span|b|strong|i|em|u|ul|ol|li|table|thead|tbody|tr|th|td|h[1-6]|sup|sub|blockquote|pre|code|hr|a|img|small|center|font)(?:\s+[a-zA-Z_:][\w:-]*(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+))?)*\s*\/?>/gi;

const SUP_MAP: Record<string, string> = {
  '0': '⁰',
  '1': '¹',
  '2': '²',
  '3': '³',
  '4': '⁴',
  '5': '⁵',
  '6': '⁶',
  '7': '⁷',
  '8': '⁸',
  '9': '⁹',
  '+': '⁺',
  '-': '⁻',
  n: 'ⁿ',
};

const SUB_MAP: Record<string, string> = {
  '0': '₀',
  '1': '₁',
  '2': '₂',
  '3': '₃',
  '4': '₄',
  '5': '₅',
  '6': '₆',
  '7': '₇',
  '8': '₈',
  '9': '₉',
};

const toSuper = (txt: string) =>
  txt
    .split('')
    .map((ch) => SUP_MAP[ch] ?? ch)
    .join('');

const toSub = (txt: string) =>
  txt
    .split('')
    .map((ch) => SUB_MAP[ch] ?? ch)
    .join('');

export function cleanDisplayText(raw: string): string {
  if (!raw) return '';
  let s = raw;
  s = s.replace(/<sup>(.*?)<\/sup>/gi, (_, inner: string) => toSuper(inner.trim()));
  s = s.replace(/<sub>(.*?)<\/sub>/gi, (_, inner: string) => toSub(inner.trim()));
  s = s.replace(/<u>(.*?)<\/u>/gi, (_, inner: string) => `[${inner.trim()}]`);
  s = s.replace(/<br\s*\/?>/gi, '\n');
  s = s.replace(/<\/(?:p|div|li|tr|h[1-6])>/gi, '\n');
  s = s.replace(/<(?:p|div|li|ul|ol|table|thead|tbody|tr|h[1-6])(?:\s+[^>]*)?>/gi, '');
  s = s.replace(/<\/t[hd]>\s*<t[hd][^>]*>/gi, ' | ');
  s = s.replace(HTML_TAG_RE, '');

  s = s
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&ndash;/gi, '–')
    .replace(/&mdash;/gi, '—')
    .replace(/&times;/gi, '×')
    .replace(/&divide;/gi, '÷')
    .replace(/&plusmn;/gi, '±')
    .replace(/&le;/gi, '≤')
    .replace(/&ge;/gi, '≥')
    .replace(/\uf0e0/g, '→')
    .replace(/\uf077/g, '•')
    .replace(/[\uf000-\uf8ff]/g, '');

  // Rapikan spasi per baris tanpa menghilangkan pemisah paragraf.
  const lines = s
    .split(/\r?\n/)
    .map((ln) => ln.replace(/[ \t]+/g, ' ').trim())
    .filter((ln, idx, arr) => ln.length > 0 || (idx > 0 && idx < arr.length - 1 && arr[idx - 1] !== ''));

  return lines.join('\n').trim();
}

export function hasHtmlOrFormulaLeak(text: string): boolean {
  if (!text) return false;
  if (HTML_TAG_RE.test(text)) {
    HTML_TAG_RE.lastIndex = 0;
    return true;
  }
  HTML_TAG_RE.lastIndex = 0;
  if (/&(?:nbsp|amp|lt|gt|quot|#\d+);/i.test(text)) return true;
  if (/\\(?:frac|sqrt|times|div|cdot|text|begin|end)\b|\$\$/.test(text)) return true;
  if (/[\uf000-\uf8ff]/.test(text)) return true;
  return false;
}

const FORBIDDEN_JSON_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

/** Parser JSON aman terhadap prototype-pollution dan payload berlebihan. */
export function safeJsonParse(jsonText: string, maxBytes = 8 * 1024 * 1024): unknown {
  if (typeof jsonText !== 'string') {
    throw new Error('Input JSON harus berupa teks.');
  }
  if (jsonText.length > maxBytes) {
    throw new Error(`Ukuran berkas melebihi batas aman (${Math.round(maxBytes / 1024 / 1024)} MB).`);
  }
  return JSON.parse(jsonText, (key, value) => {
    if (FORBIDDEN_JSON_KEYS.has(key)) return undefined;
    return value;
  });
}
