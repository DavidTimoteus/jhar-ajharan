import type { ComponentChildren } from 'preact';
import { cleanDisplayText } from '../lib/sanitize';
import { parseInlineRichText, type RichToken } from '../lib/richText';

interface Props {
  text: string;
  className?: string;
  inline?: boolean;
}

function renderTokens(tokens: RichToken[], keyPrefix = 'rt'): ComponentChildren {
  return tokens.map((tok, idx) => {
    const key = `${keyPrefix}-${idx}`;
    const inner = tok.children ? renderTokens(tok.children, key) : tok.value;
    switch (tok.kind) {
      case 'highlight':
        return (
          <mark key={key} className="rt-highlight">
            {inner}
          </mark>
        );
      case 'bold':
        return (
          <strong key={key} className="rt-bold">
            {inner}
          </strong>
        );
      case 'underline':
        return (
          <u key={key} className="rt-underline">
            {inner}
          </u>
        );
      case 'strike':
        return (
          <del key={key} className="rt-strike">
            {inner}
          </del>
        );
      case 'code':
        return (
          <code key={key} className="rt-code">
            {tok.value}
          </code>
        );
      default:
        return tok.value;
    }
  });
}

export default function RichText({ text, className, inline = false }: Props) {
  const safe = cleanDisplayText(text);
  if (!safe) return null;

  if (inline) {
    return (
      <span className={className ? `rt-root ${className}` : 'rt-root'}>
        {renderTokens(parseInlineRichText(safe))}
      </span>
    );
  }

  const lines = safe.split('\n');
  return (
    <span className={className ? `rt-root rt-block ${className}` : 'rt-root rt-block'}>
      {lines.map((line, i) => (
        <span key={i} className="rt-line">
          {renderTokens(parseInlineRichText(line), `ln-${i}`)}
        </span>
      ))}
    </span>
  );
}

