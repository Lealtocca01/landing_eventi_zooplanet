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
        url: '/whatsapp-preview.jpg',
        width: 768,
        height: 768,
        alt: 'Famiglia e cuccioli in un set natalizio da Zooplanet',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Natale con i Cuccioli - Zooplanet Pantigliate',
    description:
      "L'evento più dolce dell'anno a Zooplanet Pantigliate. Registrati gratuitamente per riservare il tuo posto!",
    images: ['/whatsapp-preview.jpg'],
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
