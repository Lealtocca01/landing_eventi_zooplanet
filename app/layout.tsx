import './globals.css';
import type { Metadata } from 'next';
import { Nunito } from 'next/font/google';

const nunito = Nunito({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-nunito',
});

export const metadata: Metadata = {
  title: 'Natale con i Cuccioli - Zooplanet Pantigliate',
  description:
    "L'evento più dolce dell'anno a Zooplanet Pantigliate. Registrati gratuitamente per riservare il tuo posto!",
  openGraph: {
    title: 'Natale con i Cuccioli - Zooplanet Pantigliate',
    description:
      "L'evento più dolce dell'anno a Zooplanet Pantigliate. Registrati gratuitamente per riservare il tuo posto!",
    type: 'website',
    images: [
      {
        url: 'https://landing-eventi-zooplanet.vercel.app/Progetto%20senza%20titolo.png',
        width: 1200,
        height: 630,
        alt: 'Natale con i Cuccioli Zooplanet',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Natale con i Cuccioli - Zooplanet Pantigliate',
    description:
      "L'evento più dolce dell'anno a Zooplanet Pantigliate. Registrati gratuitamente per riservare il tuo posto!",
    images: ['https://landing-eventi-zooplanet.vercel.app/Progetto%20senza%20titolo.png'],
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
