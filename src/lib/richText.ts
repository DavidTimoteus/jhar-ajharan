// Tokenizer teks berformat semantik aman (tanpa dangerouslySetInnerHTML).
// Mendukung: **bold**, __underline__, ~~strikethrough~~, ==highlight==, dan `rumus`.
// Menjaga isian rumpang seperti "_____" maupun snake_case agar tidak rusak.

export type RichKind = 'text' | 'bold' | 'italic' | 'underline' | 'strike' | 'highlight' | 'code';

export interface RichToken {
  kind: RichKind;
  value: string;
  children?: RichToken[];
}

const TOKEN_RE =
  /==([^=\n](?:[^\n]*?[^=\n])?)==|\*\*([^\*\n](?:[^\n]*?[^\*\n])?)\*\*|__(?!_)([^_\n](?:[^\n]*?[^_\n])?)__|~~([^~\n](?:[^\n]*?[^~\n])?)~~|`([^`\n]+)`|\*([^\s*\n](?:[^\n*]*?[^\s*\n])?)\*/g;

export function parseInlineRichText(input: string, depth = 0): RichToken[] {
  if (!input) return [];
  if (depth > 2) return [{ kind: 'text', value: input }];

  const tokens: RichToken[] = [];
  const re = new RegExp(TOKEN_RE.source, 'g');
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = re.exec(input)) !== null) {
    if (match.index > lastIndex) {
      tokens.push({ kind: 'text', value: input.slice(lastIndex, match.index) });
    }

    if (match[1] !== undefined) {
      tokens.push({
        kind: 'highlight',
        value: match[1],
        children: parseInlineRichText(match[1], depth + 1),
      });
    } else if (match[2] !== undefined) {
      tokens.push({
        kind: 'bold',
        value: match[2],
        children: parseInlineRichText(match[2], depth + 1),
      });
    } else if (match[3] !== undefined) {
      tokens.push({
        kind: 'underline',
        value: match[3],
        children: parseInlineRichText(match[3], depth + 1),
      });
    } else if (match[4] !== undefined) {
      tokens.push({
        kind: 'strike',
        value: match[4],
        children: parseInlineRichText(match[4], depth + 1),
      });
    } else if (match[5] !== undefined) {
      tokens.push({ kind: 'code', value: match[5] });
    } else if (match[6] !== undefined) {
      tokens.push({
        kind: 'italic',
        value: match[6],
        children: parseInlineRichText(match[6], depth + 1),
      });
    }

    lastIndex = re.lastIndex;
  }

  if (lastIndex < input.length) {
    tokens.push({ kind: 'text', value: input.slice(lastIndex) });
  }
  return tokens;
}

