// Utilitas cursor-tracked spotlight (--spot-x, --spot-y) untuk permukaan taktil.
import type { JSX } from 'preact';

export const onSpotlightMove: JSX.PointerEventHandler<HTMLElement> = (e) => {
  const el = e.currentTarget;
  const rect = el.getBoundingClientRect();
  el.style.setProperty('--spot-x', `${e.clientX - rect.left}px`);
  el.style.setProperty('--spot-y', `${e.clientY - rect.top}px`);
};

