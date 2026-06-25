'use client';

import * as React from 'react';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore — shadcn installs as .jsx with no type declarations
import Particles from '@/components/Particles';
import { useThemeStore } from '@/store/theme.store';

const ActiveBackground = () => {
  const mode = useThemeStore((s) => s.mode);
  const colors = mode === 'light' ? ['#1e1e2e'] : ['#ffffff'];
  return (
  <Particles
    particleColors={colors}
    particleCount={200}
    particleSpread={10}
    speed={0.2}
    particleBaseSize={100}
    moveParticlesOnHover
    alphaParticles={false}
    disableRotation={false}
    pixelRatio={1}
    className=""
  />
  );
};

export function ReactBitsBackground({ children }: { children: React.ReactNode }) {
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)');
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return (
    <div style={{ position: 'relative', minHeight: '100vh', width: '100%' }}>
      {!isMobile && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 0 }}>
          <ActiveBackground />
        </div>
      )}
      <div style={{ position: 'relative', zIndex: 1 }}>
        {children}
      </div>
    </div>
  );
}
