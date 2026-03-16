import './globals.css';
import type { Metadata } from 'next';
import { Nunito } from 'next/font/google';

const nunito = Nunito({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-nunito',
});

export const metadata: Metadata = {
  title: 'Zooplanet La Chiarella compie 5 anni! - Festa 28 Marzo',
  description:
    "Festeggia con noi i 5 anni di Zooplanet La Chiarella! 20% di sconto su tutto, gadget in regalo e foto gratis con il tuo amico a 4 zampe. 28 Marzo, dalle 10 alle 18.",
  openGraph: {
    title: 'Zooplanet La Chiarella compie 5 anni! - Festa 28 Marzo',
    description:
      "Festeggia con noi i 5 anni di Zooplanet La Chiarella! 20% di sconto su tutto, gadget in regalo e foto gratis con il tuo amico a 4 zampe.",
    type: 'website',
    url: 'https://landing-eventi-zooplanet.vercel.app/',
    images: [
      {
        url: 'https://landing-eventi-zooplanet.vercel.app/whatsapp-preview-final.jpg',
        width: 1200,
        height: 630,
        alt: 'Zooplanet La Chiarella - 5 anni di passione per gli animali',
        type: 'image/jpeg',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Zooplanet La Chiarella compie 5 anni! - Festa 28 Marzo',
    description:
      "Festeggia con noi i 5 anni di Zooplanet La Chiarella! 20% di sconto su tutto, gadget in regalo e foto gratis con il tuo amico a 4 zampe.",
    images: ['https://landing-eventi-zooplanet.vercel.app/whatsapp-preview-final.jpg'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="it">
      <body className={nunito.className}>{children}</body>
    </html>
  );
}
