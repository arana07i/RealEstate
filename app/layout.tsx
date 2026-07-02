import type { Metadata } from 'next';
import { Montserrat, Inter, Geist } from 'next/font/google';
import './globals.css';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Toaster } from 'react-hot-toast';
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://himalayancrestrealty.com'),
  title: {
    default: 'Himalayan Crest Realty | Premium Real Estate in Shimla',
    template: '%s | Himalayan Crest Realty',
  },
  description:
    'Shimla\'s premier real estate agency. Luxury homes, heritage properties, and investment opportunities in the Queen of Hills.',
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    siteName: 'Himalayan Crest Realty',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={cn(montserrat.variable, inter.variable, "font-sans", geist.variable)}>
      <body>
        <ErrorBoundary>{children}</ErrorBoundary>
        <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
      </body>
    </html>
  );
}
