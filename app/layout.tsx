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
  title: 'Sfilata dei cuccioli — 17 ottobre | Zooplanet Lacchiarella',
  description:
    "Il 17 ottobre a Zooplanet Lacchiarella: sfilata con cappottini Ferribiella, premi per i primi 3 classificati, -20% su tutti i prodotti e omaggi per tutti.",
  openGraph: {
    title: 'Sfilata dei cuccioli — 17 ottobre | Zooplanet Lacchiarella',
    description:
      "Sfilata dei cuccioli il 17 ottobre, in collaborazione con Ferribiella. Premi per i primi 3 classificati, -20% su tutti i prodotti e omaggi per tutti.",
    type: 'website',
    url: 'https://landing-eventi-zooplanet.vercel.app/',
    images: [
      {
        url: 'https://landing-eventi-zooplanet.vercel.app/sfilata-cuccioli-17-ottobre.jpg',
        width: 1254,
        height: 1254,
        alt: 'Sfilata dei cuccioli — 17 ottobre, Zooplanet Lacchiarella',
        type: 'image/jpeg',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sfilata dei cuccioli — 17 ottobre | Zooplanet Lacchiarella',
    description:
      "Sfilata dei cuccioli il 17 ottobre, in collaborazione con Ferribiella. Premi per i primi 3 classificati, -20% su tutti i prodotti e omaggi per tutti.",
    images: ['https://landing-eventi-zooplanet.vercel.app/sfilata-cuccioli-17-ottobre.jpg'],
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
