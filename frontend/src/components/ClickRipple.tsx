import { useEffect, useCallback } from 'react';

/**
 * ClickRipple — Spawns a playful ink-splash animation at every click position.
 * Renders nothing visible; just attaches a global mousedown listener.
 */
export function ClickRipple() {
  const createRipple = useCallback((e: MouseEvent) => {
    const x = e.clientX;
    const y = e.clientY;

    // 1. Ring ripple
    const ripple = document.createElement('div');
    ripple.className = 'click-ripple';
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    document.body.appendChild(ripple);

    // 2. Ink burst — small SVG star
    const burst = document.createElement('div');
    burst.className = 'click-burst';
    burst.style.left = `${x}px`;
    burst.style.top = `${y}px`;
    burst.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L14 10L22 12L14 14L12 22L10 14L2 12L10 10Z" 
              fill="#f472b6" stroke="#0f172a" stroke-width="1.5" stroke-linejoin="round"/>
      </svg>
    `;
    document.body.appendChild(burst);

    // Cleanup after animation completes
    setTimeout(() => {
      ripple.remove();
      burst.remove();
    }, 600);
  }, []);

  useEffect(() => {
    document.addEventListener('mousedown', createRipple);
    return () => document.removeEventListener('mousedown', createRipple);
  }, [createRipple]);

  return null;
}
