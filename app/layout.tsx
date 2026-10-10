import './globals.css';
import type { Metadata } from 'next';
import { Nunito } from 'next/font/google';
import Script from 'next/script';

const nunito = Nunito({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-nunito',
});

export const metadata: Metadata = {
  title: 'Sfilata dei Cuccioli – 17 ottobre 2026 | Zooplanet Lacchiarella',
  description:
    "Sabato 17 ottobre, dalle 15:00 alle 18:00: Sfilata dei Cuccioli con Ferribiella. Super premio ai primi 3, -20% su tutti i prodotti, omaggi e gadget per tutti. Evento aperto a tutti.",
  openGraph: {
    title: 'Sfilata dei Cuccioli – 17 ottobre 2026 | Zooplanet Lacchiarella',
    description:
      "Sfilata dei Cuccioli con Ferribiella: sabato 17 ottobre 2026, dalle 15:00 alle 18:00. Super premio ai primi 3, -20% su tutti i prodotti, omaggi e gadget per tutti.",
    type: 'website',
    url: 'https://landing-eventi-zooplanet.vercel.app/',
    images: [
      {
        url: 'https://landing-eventi-zooplanet.vercel.app/sfilata-cuccioli-17-ottobre.png',
        width: 1200,
        height: 630,
        alt: 'Sfilata dei Cuccioli – 17 ottobre – Zooplanet Lacchiarella',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sfilata dei Cuccioli – 17 ottobre 2026 | Zooplanet Lacchiarella',
    description:
      "Sfilata dei Cuccioli con Ferribiella: sabato 17 ottobre 2026, dalle 15:00 alle 18:00. Super premio ai primi 3, -20% su tutti i prodotti, omaggi e gadget per tutti.",
    images: ['https://landing-eventi-zooplanet.vercel.app/sfilata-cuccioli-17-ottobre.png'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="it">
      <head>
        <Script id="meta-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '2342468022923265');
            fbq('track', 'PageView');
          `}
        </Script>
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: 'none' }}
            src="https://www.facebook.com/tr?id=2342468022923265&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>
      </head>
      <body className={nunito.className}>{children}</body>
    </html>
  );
}
