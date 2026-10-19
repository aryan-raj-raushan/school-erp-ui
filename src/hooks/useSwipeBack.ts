'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';

const EDGE_PX = 32;
const MIN_DX = 70;

export function useSwipeBack(fallbackHref: string) {
  const router = useRouter();

  React.useEffect(() => {
    let startX = 0;
    let startY = 0;
    let tracking = false;

    const onStart = (e: TouchEvent) => {
      const t = e.touches[0];
      tracking = e.touches.length === 1 && t.clientX <= EDGE_PX;
      startX = t.clientX;
      startY = t.clientY;
    };

    const onEnd = (e: TouchEvent) => {
      if (!tracking) return;
      tracking = false;
      const t = e.changedTouches[0];
      const dx = t.clientX - startX;
      const dy = Math.abs(t.clientY - startY);
      if (dx >= MIN_DX && dy < dx / 2) {
        if (window.history.length > 1) router.back();
        else router.replace(fallbackHref);
      }
    };

    window.addEventListener('touchstart', onStart, { passive: true });
    window.addEventListener('touchend', onEnd, { passive: true });
    return () => {
      window.removeEventListener('touchstart', onStart);
      window.removeEventListener('touchend', onEnd);
    };
  }, [router, fallbackHref]);
}
