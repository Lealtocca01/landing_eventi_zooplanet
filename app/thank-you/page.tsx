'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { getSupabase } from '@/lib/supabase';
import { Copy, Share2, CheckCircle2, Gift } from 'lucide-react';

function ThankYouContent() {
  const searchParams = useSearchParams();
  const code = searchParams.get('code');
  const [copied, setCopied] = useState(false);
  const [referralCount, setReferralCount] = useState(0);
  const referralLink =
    typeof window !== 'undefined' ? `${window.location.origin}/?code=${code}` : '';

  useEffect(() => {
    if (!code) return;

    const supabase = getSupabase();
    if (!supabase) return;

    const fetchReferralCount = async () => {
      const { data } = await supabase
        .from('registrations')
        .select('referral_count')
        .eq('referral_code', code)
        .maybeSingle();

      if (data) {
        setReferralCount(data.referral_count);
      }
    };

    fetchReferralCount();

    const channel = supabase
      .channel('referral-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'registrations',
          filter: `referral_code=eq.${code}`,
        },
        (payload: any) => {
          setReferralCount(payload.new.referral_count);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [code]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareOnWhatsApp = () => {
    const message = encodeURIComponent(
      `Ciao! Ti invito alla Sfilata dei cuccioli del 17 ottobre da Zooplanet Lacchiarella, in collaborazione con Ferribiella! Premi per i primi 3 classificati, -20% su tutti i prodotti e omaggi e gadget per tutti. Registrati qui: ${referralLink}`
    );
    window.open(`https://wa.me/?text=${message}`, '_blank');
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-green-50 via-white to-orange-50">
      <div className="max-w-3xl mx-auto px-4 py-16 md:py-24">
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12">
          <div className="text-center space-y-6">
            <div className="inline-block p-6 bg-green-100 rounded-full">
              <CheckCircle2 className="w-20 h-20 text-[#6ABF4B]" />
            </div>

            <h1 className="text-4xl md:text-6xl font-black text-gray-900">
              Sei <span className="text-[#6ABF4B]">registrato</span>!
            </h1>

            <p className="text-xl md:text-2xl text-gray-600 font-light">
              Non vediamo l'ora di vederti alla <span className="font-bold text-gray-900">Sfilata dei cuccioli del 17 ottobre da Zooplanet Lacchiarella</span>!
            </p>

            <div className="p-6 bg-orange-50 rounded-2xl border-2 border-[#EE7623]">
              <p className="text-lg text-gray-700">
                Riceverai una email di conferma con tutti i dettagli dell'evento
              </p>
            </div>
          </div>

          <div className="mt-12 space-y-6">
            <div className="text-center space-y-6">
              <Gift className="w-16 h-16 text-[#EE7623] mx-auto animate-pulse" />
              <h2 className="text-3xl md:text-4xl font-black text-gray-900">
                Invita i tuoi amici alla sfilata
              </h2>
              <p className="text-xl text-gray-700">
                L’evento è aperto a tutti, con omaggi e gadget per tutti i partecipanti!
              </p>
            </div>

            <div className="space-y-4">
              <label className="block text-sm font-semibold text-gray-700">
                Il tuo link personale
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={referralLink}
                  readOnly
                  className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl bg-gray-50 text-gray-700 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                onClick={copyToClipboard}
                size="lg"
                variant="outline"
                className="border-2 border-[#EE7623] text-[#EE7623] hover:bg-[#EE7623] hover:text-white py-6 rounded-xl transition-all duration-300"
              >
                <Copy className="w-5 h-5 mr-2" />
                {copied ? 'Copiato!' : 'Copia il link'}
              </Button>

              <Button
                onClick={shareOnWhatsApp}
                size="lg"
                className="bg-[#25D366] hover:bg-[#1da851] text-white py-6 rounded-xl transition-all duration-300"
              >
                <Share2 className="w-5 h-5 mr-2" />
                Condividi su WhatsApp
              </Button>
            </div>

            <div className="p-6 bg-gray-50 rounded-2xl">
              <h3 className="font-bold text-gray-900 mb-3">Come funziona:</h3>
              <ol className="space-y-2 text-gray-600">
                <li className="flex items-start">
                  <span className="font-bold text-[#EE7623] mr-2">1.</span>
                  Copia il tuo link personale
                </li>
                <li className="flex items-start">
                  <span className="font-bold text-[#EE7623] mr-2">2.</span>
                  Condividilo con i tuoi amici via WhatsApp, email o social
                </li>
                <li className="flex items-start">
                  <span className="font-bold text-[#EE7623] mr-2">3.</span>
                  Vi aspettiamo il 17 ottobre da Zooplanet Lacchiarella
                </li>
              </ol>
            </div>
          </div>

          <div className="mt-12 text-center">
            <Button
              onClick={() => (window.location.href = '/')}
              size="lg"
              className="bg-[#6ABF4B] hover:bg-[#5ba942] text-white px-12 py-6 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
            >
              Torna alla home
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function ThankYouPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-gray-600">Caricamento...</p>
      </div>
    }>
      <ThankYouContent />
    </Suspense>
  );
}
