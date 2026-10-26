import type { Metadata, Viewport } from 'next';
import { Geist, Inter } from 'next/font/google';
import { Toaster } from 'sonner';
import { ThemeProvider } from '@/components/ui/theme-provider';
import './globals.css';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ChatPatternBackground } from '@/components/background/chat-pattern-background';
import { InputGuards } from '@/components/layout/InputGuards';

const geist = Geist({ subsets: ['latin'], variable: '--font-geist' });
const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'MyESathi',
  description: 'School management system',
};

// viewportFit: 'cover' is what makes env(safe-area-inset-*) resolve to real
// values instead of 0 — required for content to sit correctly behind the
// notch/status bar on native (Capacitor) screens.
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
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
        <InputGuards />
        <ThemeProvider>
          <TooltipProvider>
            <ChatPatternBackground>{children}</ChatPatternBackground>
          </TooltipProvider>
        </ThemeProvider>
        <Toaster
          position="top-right"
          richColors
          offset={{ top: "calc(var(--sat, 0px) + 16px)", right: 16 }}
          mobileOffset={{ top: "calc(var(--sat, 0px) + 12px)", right: 12, left: 12 }}
        />
      </body>
    </html>
  );
}
