import type { Metadata, Viewport } from 'next';
import { Geist, Inter } from 'next/font/google';
import { Toaster } from 'sonner';
import { ThemeProvider } from '@/components/ui/theme-provider';
import './globals.css';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ChatPatternBackground } from '@/components/background/chat-pattern-background';

const geist = Geist({ subsets: ['latin'], variable: '--font-geist' });
const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'School ERP',
  description: 'School management system',
};

// viewportFit: 'cover' is what makes env(safe-area-inset-*) resolve to real
// values instead of 0 — required for content to sit correctly behind the
// notch/status bar on native (Capacitor) screens.
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geist.variable} ${inter.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full font-[family-name:var(--font-inter,var(--font-geist))]">
        <ThemeProvider>
          <TooltipProvider>
            <ChatPatternBackground>{children}</ChatPatternBackground>
          </TooltipProvider>
        </ThemeProvider>
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
