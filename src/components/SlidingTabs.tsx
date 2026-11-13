import { useEffect, useRef, useState } from 'preact/hooks';

export interface TabOption<T extends string> {
  id: T;
  label: string;
  count?: number;
  dotColor?: string;
}

interface Props<T extends string> {
  items: TabOption<T>[];
  value: T;
  onChange: (id: T) => void;
  className?: string;
  ariaLabel?: string;
}

export default function SlidingTabs<T extends string>({
  items,
  value,
  onChange,
  className = '',
  ariaLabel = 'Filter',
}: Props<T>) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const btnRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [glider, setGlider] = useState({ x: 0, w: 0, ready: false });

  useEffect(() => {
    const update = () => {
      const btn = btnRefs.current[value];
      if (!btn) return;
      setGlider({ x: btn.offsetLeft, w: btn.offsetWidth, ready: true });
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [value, items]);

  return (
    <div
      ref={wrapRef}
      className={`sliding-tabs ${className}`}
      role="tablist"
      aria-label={ariaLabel}
    >
      <span
        className={`tab-glider ${glider.ready ? 'is-ready' : ''}`}
        style={{
          width: `${glider.w}px`,
          transform: `translate3d(${glider.x}px, 0, 0)`,
        }}
        aria-hidden="true"
      />
      {items.map((item) => {
        const active = item.id === value;
        return (
          <button
            key={item.id}
            ref={(el) => {
              btnRefs.current[item.id] = el;
            }}
            type="button"
            role="tab"
            aria-selected={active}
            className={`sliding-tab ${active ? 'is-active' : ''}`}
            onClick={() => onChange(item.id)}
          >
            {item.dotColor && (
              <span
                className="tab-dot"
                style={{ backgroundColor: item.dotColor }}
                aria-hidden="true"
              />
            )}
            <span>{item.label}</span>
            {typeof item.count === 'number' && (
              <span className="tab-count num">{item.count}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

