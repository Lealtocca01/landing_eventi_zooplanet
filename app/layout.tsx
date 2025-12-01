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
  description: "L'evento più dolce dell'anno a Zooplanet Pantigliate. Registrati gratuitamente per riservare il tuo posto!",
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
