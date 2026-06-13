import type { Metadata } from 'next';
import { Geist, Inter } from 'next/font/google';
import { Toaster } from 'sonner';
import { ThemeProvider } from '@/components/ui/theme-provider';
import './globals.css';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ReactBitsBackground } from '@/components/reactbits/background';

const geist = Geist({ subsets: ['latin'], variable: '--font-geist' });
const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'School ERP',
  description: 'School management system',
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
            <ReactBitsBackground>{children}</ReactBitsBackground>
          </TooltipProvider>
        </ThemeProvider>
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
