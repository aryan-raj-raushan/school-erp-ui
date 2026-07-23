'use client';

import * as React from 'react';

/**
 * School/education themed line-art doodles, scattered on a jittered grid
 * (not a strict repeating tile) so gaps read as random, each drifting
 * slowly and independently via a float animation.
 */
const CELL = 92;
const MIN_ICON = 18;
const MAX_ICON = 30;

// Each icon is a set of 24x24-viewBox path strings, lucide-style line art.
const ICONS: string[][] = [
  // open book
  ['M2 5.2c2.3-1.3 5.4-1.4 8 0v13.6c-2.6-1.4-5.7-1.3-8 0V5.2z', 'M22 5.2c-2.3-1.3-5.4-1.4-8 0v13.6c2.6-1.4 5.7-1.3 8 0V5.2z'],
  // pencil
  ['M14.2 3.3l6.5 6.5L9.2 21.3H2.7v-6.5L14.2 3.3z', 'M12.7 5.8l4.5 4.5'],
  // graduation cap
  ['M12 2.5 2.3 8l9.7 4.8L21.7 8 12 2.5z', 'M6.5 10.6v4.8c0 1.7 2.5 3.1 5.5 3.1s5.5-1.4 5.5-3.1v-4.8', 'M21 8.3v5.6'],
  // apple
  ['M12 6.2c-2.4-2.1-5.8-1-5.8 3 0 4 2.9 8.8 5.8 8.8s5.8-4.8 5.8-8.8c0-4-3.4-5.1-5.8-3z', 'M12 6.2c0-2 1-3.4 2.4-4.2'],
  // ruler
  ['M3.2 17.6 17.6 3.2l3.2 3.2L6.4 20.8z', 'M8.6 12.2l1.6 1.6', 'M12 8.8l1.6 1.6', 'M5.9 14.9l1.6 1.6'],
  // backpack
  ['M8.5 6.2V4.4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v1.8', 'M6.3 6.2h11.4a2 2 0 0 1 2 2v11.4a2 2 0 0 1-2 2H6.3a2 2 0 0 1-2-2V8.2a2 2 0 0 1 2-2z', 'M9.5 10.8h5', 'M9.5 21.6v-5.6h5v5.6'],
  // lightbulb
  ['M9.5 18.5h5', 'M10.3 21h3.4', 'M12 3.2a5.8 5.8 0 0 0-3.7 10.3c.7.6 1.1 1.4 1.1 2.4h5.2c0-1 .4-1.8 1.1-2.4A5.8 5.8 0 0 0 12 3.2z'],
  // globe
  ['M12 2.4a9.6 9.6 0 1 0 .1 0Z', 'M2.4 12h19.2', 'M12 2.4c2.4 2.4 3.8 5.9 3.8 9.6s-1.4 7.2-3.8 9.6', 'M12 2.4c-2.4 2.4-3.8 5.9-3.8 9.6s1.4 7.2 3.8 9.6'],
  // paper plane
  ['M3 11.4 21 3.4 13 21.4l-2-8-8-2z'],
  // star
  ['M12 2.6l2.7 6.4 6.9.5-5.3 4.5 1.7 6.8L12 17l-6 3.8 1.7-6.8-5.3-4.5 6.9-.5L12 2.6z'],
  // alarm clock
  ['M12 20.5a7.3 7.3 0 1 0 0-14.6 7.3 7.3 0 0 0 0 14.6z', 'M12 9.5v3.7l2.6 2.6', 'M4.6 4.6 2.9 6.3', 'M19.4 4.6l1.7 1.7'],
  // notebook / clipboard
  ['M6.5 3.4h11a1.6 1.6 0 0 1 1.6 1.6v14a1.6 1.6 0 0 1-1.6 1.6h-11a1.6 1.6 0 0 1-1.6-1.6V5a1.6 1.6 0 0 1 1.6-1.6z', 'M9 8.2h6', 'M9 12h6', 'M9 15.8h4'],
];

interface Doodle {
  id: number;
  x: number;
  y: number;
  size: number;
  rotation: number;
  icon: number;
  duration: number;
  delay: number;
  dx: number;
  dy: number;
}

function generateDoodles(width: number, height: number): Doodle[] {
  const cols = Math.ceil(width / CELL) + 1;
  const rows = Math.ceil(height / CELL) + 1;
  const doodles: Doodle[] = [];
  let id = 0;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const jitterX = (Math.random() - 0.5) * CELL * 0.7;
      const jitterY = (Math.random() - 0.5) * CELL * 0.7;
      doodles.push({
        id: id++,
        x: c * CELL + CELL / 2 + jitterX,
        y: r * CELL + CELL / 2 + jitterY,
        size: MIN_ICON + Math.random() * (MAX_ICON - MIN_ICON),
        rotation: (Math.random() - 0.5) * 50,
        icon: Math.floor(Math.random() * ICONS.length),
        duration: 9 + Math.random() * 10,
        delay: -Math.random() * 18,
        dx: (Math.random() - 0.5) * 16,
        dy: (Math.random() - 0.5) * 16,
      });
    }
  }
  return doodles;
}

function DoodleIcon({ paths, size, color }: { paths: string[]; size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {paths.map((d, i) => (
        <path key={i} d={d} stroke={color} strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" />
      ))}
    </svg>
  );
}

export function ChatPatternBackground({ children }: { children: React.ReactNode }) {
  const [doodles, setDoodles] = React.useState<Doodle[] | null>(null);
  const [color, setColor] = React.useState('#000000');

  React.useEffect(() => {
    const recomputeColor = () => {
      const isDark = document.documentElement.classList.contains('dark');
      setColor(isDark ? '#ffffff' : '#000000');
    };
    recomputeColor();

    const observer = new MutationObserver(recomputeColor);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    let resizeTimer: ReturnType<typeof setTimeout>;
    const recomputeLayout = () => {
      setDoodles(generateDoodles(window.innerWidth, window.innerHeight));
    };
    recomputeLayout();

    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(recomputeLayout, 300);
    };
    window.addEventListener('resize', onResize);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', onResize);
      clearTimeout(resizeTimer);
    };
  }, []);

  return (
    <div style={{ position: 'relative', minHeight: '100vh', width: '100%' }}>
      <div
        aria-hidden
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 0,
          overflow: 'hidden',
          backgroundColor: 'var(--background)',
        }}
      >
        {doodles?.map((d) => (
          <div
            key={d.id}
            style={
              {
                position: 'absolute',
                left: d.x,
                top: d.y,
                opacity: 0.09,
                transform: `translate(-50%, -50%) rotate(${d.rotation}deg)`,
                animation: `bg-doodle-float ${d.duration}s ease-in-out ${d.delay}s infinite`,
                '--doodle-rot': `${d.rotation}deg`,
                '--doodle-dx': `${d.dx}px`,
                '--doodle-dy': `${d.dy}px`,
              } as React.CSSProperties
            }
          >
            <DoodleIcon paths={ICONS[d.icon]} size={d.size} color={color} />
          </div>
        ))}
      </div>
      <div style={{ position: 'relative', zIndex: 1 }}>{children}</div>
    </div>
  );
}
