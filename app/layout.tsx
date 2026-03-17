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
  title: 'Zooplanet Lacchiarella compie 5 anni! - Festa 28 Marzo',
  description:
    "Festeggia con noi i 5 anni di Zooplanet Lacchiarella! 20% di sconto su tutto, gadget in regalo e foto gratis con il tuo amico a 4 zampe. 28 Marzo, dalle 10 alle 18.",
  openGraph: {
    title: 'Zooplanet Lacchiarella compie 5 anni! - Festa 28 Marzo',
    description:
      "Festeggia con noi i 5 anni di Zooplanet Lacchiarella! 20% di sconto su tutto, gadget in regalo e foto gratis con il tuo amico a 4 zampe.",
    type: 'website',
    url: 'https://landing-eventi-zooplanet.vercel.app/',
    images: [
      {
        url: 'https://landing-eventi-zooplanet.vercel.app/whatsapp-preview-final.jpg',
        width: 1200,
        height: 630,
        alt: 'Zooplanet Lacchiarella - 5 anni di passione per gli animali',
        type: 'image/jpeg',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Zooplanet Lacchiarella compie 5 anni! - Festa 28 Marzo',
    description:
      "Festeggia con noi i 5 anni di Zooplanet Lacchiarella! 20% di sconto su tutto, gadget in regalo e foto gratis con il tuo amico a 4 zampe.",
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
