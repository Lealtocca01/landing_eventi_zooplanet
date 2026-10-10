'use client';

declare global {
  interface Window {
    fbq: (...args: unknown[]) => void;
  }
}

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { getSupabase } from '@/lib/supabase';
import { Heart, Calendar, Trophy, Gift, Sparkles, Percent } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';

export default function Home() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const referredByFromUrl =
    searchParams.get('code') || searchParams.get('ref') || '';

  const [participants, setParticipants] = useState<number>(1);
  const timeSlot = '15:00 - 18:00';
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    city: '',
    email: '',
    phone: '',
    dogBreed: '',
    privacyAccepted: false,
    referredBy: referredByFromUrl,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const scrollToForm = () => {
    document.getElementById('registration-form')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!formData.dogBreed.trim()) {
      setError('Indica la razza del cane, oppure scrivi Meticcio');
      setLoading(false);
      return;
    }

    if (!formData.privacyAccepted) {
      setError('Devi accettare la privacy policy per procedere');
      setLoading(false);
      return;
    }

    try {
      const supabase = getSupabase();

      if (!supabase) {
        setError('Errore di configurazione. Contatta il supporto.');
        setLoading(false);
        return;
      }

      // Cleaned payload
      const clean = {
        first_name: formData.firstName?.trim() || null,
        last_name: formData.lastName?.trim() || null,
        city: formData.city?.trim() || null,
        email: formData.email?.trim() || null,
        phone: formData.phone?.trim() || null,
        dog_breed: formData.dogBreed.trim(),
        participants: participants,
        time_slot: timeSlot,
        referred_by: formData.referredBy?.trim() || null,
        privacy_accepted: !!formData.privacyAccepted,
      };


      // INSERT
      const { data, error: insertError } = await supabase
        .from('registrations')
        .insert([clean])
        .select()
        .maybeSingle();


      if (insertError) {
        if (insertError.code === '23505') {
          setError('Questa email è già registrata');
        } else {
          setError('Errore durante la registrazione. Riprova.');
        }
        setLoading(false);
        return;
      }

      // Referral count update
      const referredBy = formData.referredBy?.trim();
      if (data && referredBy) {
        const { error: rpcError } = await supabase.rpc(
          'increment_referral_count',
          {
            ref_code: referredBy,
          }
        );
        if (rpcError) {
          console.error('RPC Error:', rpcError);
        }
      }

      // Webhook notification
      if (data) {
        try {
          await fetch(
            '/api/registration-confirmation',
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                registration_id: data.id,
                email: data.email,
                referral_code: data.referral_code,
                first_name: formData.firstName,
                last_name: formData.lastName,
                phone: formData.phone,
                dog_breed: formData.dogBreed.trim(),
                participants,
                time_slot: timeSlot,
              }),
            }
          );
        } catch (webhookError) {
          console.error('Webhook Error:', webhookError);
        }
      }

      // Meta Pixel: track Lead
      if (data && typeof window !== 'undefined' && typeof window.fbq === 'function') {
        window.fbq('track', 'Lead');
      }

      // Redirect
      if (data) {
        router.push(`/thank-you?code=${data.referral_code}`);
      }
    } catch (err) {
      setError('Errore di connessione. Riprova.');
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-orange-50 via-white to-green-50 overflow-x-hidden">
      <section className="relative min-h-[95vh] flex flex-col items-center justify-center px-6 md:px-10 lg:px-12 py-20 md:py-32">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNFRTc2MjMiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE0YzAgNC40MTgtMy41ODIgOC04IDhzLTgtMy41ODItOC04IDMuNTgyLTggOC04IDggMy41ODIgOCA4eiIvPjwvZz48L2c+PC9zdmc+')] opacity-40"></div>

        <div className="relative z-10 max-w-5xl mx-auto text-left md:text-center space-y-6 w-full px-3 sm:px-4 md:px-0">
          <div className="space-y-2">
            <h1 className="text-6xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl 2xl:text-9xl font-black text-gray-900 leading-[1.1] tracking-[-0.02em] drop-shadow-[0_3px_6px_rgba(0,0,0,0.2)] break-words [-webkit-text-stroke:1px_rgba(0,0,0,0.05)]">
              Sfilata dei
              <br />
              <span className="text-[#EE7623] drop-shadow-[0_2px_4px_rgba(0,0,0,0.15)] font-black text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl 2xl:text-[10rem]">Cuccioli</span>
            </h1>

            <p className="text-sm md:text-base text-gray-600 font-medium text-left md:text-center -mt-1">
              Zooplanet Lacchiarella · in collaborazione con Ferribiella
            </p>
            <p className="text-lg md:text-xl font-bold text-[#EE7623] text-left md:text-center mt-1">
              📅 Sabato 17 ottobre 2026 · dalle 15:00 alle 18:00
            </p>
          </div>

          <div className="space-y-3 text-2xl md:text-2xl lg:text-3xl text-gray-700 max-w-3xl mx-auto md:mx-auto">
            <p className="font-light">
              Il tuo cucciolo sfila con i <span className="font-black text-gray-900">cappottini Ferribiella</span>. Un <span className="font-black text-gray-900">super premio</span> aspetta i primi 3 classificati!
            </p>
            <p className="text-[#EE7623] font-bold text-2xl md:text-3xl lg:text-4xl">
              <span className="font-black">-20% su tutti i prodotti</span>, omaggi e gadget per tutti. Evento aperto a tutti!
            </p>
          </div>

          <div className="relative w-full max-w-2xl mx-auto rounded-3xl overflow-hidden shadow-2xl my-8 transition-transform hover:scale-105 duration-300">
            <div className="aspect-[1200/630] relative">
              <Image
                src="/sfilata-cuccioli-hero.jpg"
                alt="Illustrazione di cuccioli in passerella con cappottini"
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>

          <Button
            onClick={scrollToForm}
            size="lg"
            className="w-full max-w-md mx-auto bg-[#EE7623] hover:bg-[#d66a1f] text-white text-lg py-6 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
          >
            Iscriviti alla sfilata
          </Button>
        </div>
      </section>

      <section className="py-16 md:py-24 px-4 bg-gradient-to-b from-white to-orange-50 relative overflow-hidden">
        {/* Accenti festosi */}
        <div className="absolute top-10 left-10 text-[#EE7623] opacity-20 text-4xl animate-pulse">🎉</div>
        <div className="absolute top-20 right-20 text-[#6ABF4B] opacity-20 text-3xl animate-pulse delay-300">✨</div>
        <div className="absolute bottom-20 left-20 text-[#EE7623] opacity-20 text-3xl animate-pulse delay-700">🐾</div>
        
        <div className="max-w-6xl mx-auto relative z-10">
          <h2 className="text-4xl md:text-5xl font-black text-center text-gray-900 mb-16 drop-shadow-[0_2px_4px_rgba(0,0,0,0.1)]">
            <span className="text-[#EE7623]">5 motivi</span> per cui <span className="italic">non puoi mancare</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { icon: Percent, title: '-20% su tutti i prodotti', text: 'Approfitta dello sconto durante l’evento.' },
              { icon: Gift, title: 'Omaggi e gadget per tutti', text: 'Ti aspettiamo con tanti omaggi per te e il tuo cucciolo.' },
              { icon: Trophy, title: 'Super premio ai primi 3', text: 'I primi 3 classificati della sfilata vincono un super premio.' },
              { icon: Heart, title: 'In passerella con Ferribiella', text: 'I cuccioli sfilano con i cappottini Ferribiella.' },
              { icon: Sparkles, title: 'Evento aperto a tutti', text: 'Porta il tuo amico a 4 zampe e partecipa con noi!' },
            ].map(({ icon: Icon, title, text }, index) => (
              <div key={title} className={`rounded-3xl p-8 shadow-xl bg-white ${index === 4 ? 'md:col-span-2' : ''}`}>
                <Icon className="w-10 h-10 text-[#EE7623] mb-4" />
                <h3 className="text-2xl font-black text-gray-900 mb-3">{title}</h3>
                <p className="text-lg text-gray-600">{text}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button
              onClick={scrollToForm}
              size="lg"
              className="w-full max-w-md mx-auto bg-[#6ABF4B] hover:bg-[#5ba942] text-white text-lg py-6 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
            >
              Iscriviti alla sfilata
            </Button>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-black text-center text-gray-900 mb-16 drop-shadow-[0_2px_4px_rgba(0,0,0,0.1)]">
            Come funziona
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center space-y-4 p-8 rounded-3xl bg-gradient-to-br from-orange-50 to-white hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="w-20 h-20 mx-auto bg-[#EE7623] rounded-full flex items-center justify-center">
                <Calendar className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-black text-gray-900">
                1. <span className="text-[#EE7623]">Registrati</span>
              </h3>
              <p className="text-lg text-gray-600 font-light">
                Compila il modulo per <span className="font-semibold">iscriverti alla sfilata</span>.
              </p>
            </div>

            <div className="text-center space-y-4 p-8 rounded-3xl bg-gradient-to-br from-green-50 to-white hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="w-20 h-20 mx-auto bg-[#6ABF4B] rounded-full flex items-center justify-center">
                <Gift className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-black text-gray-900">
                2. Vieni con il tuo <span className="text-[#EE7623] italic">cucciolo</span>
              </h3>
              <p className="text-lg text-gray-600 font-light">
                <span className="font-bold">Sconti</span>, <span className="font-semibold">gadget</span> e tante <span className="italic">sorprese</span> ti aspettano.
              </p>
            </div>

            <div className="text-center space-y-4 p-8 rounded-3xl bg-gradient-to-br from-orange-50 to-white hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="w-20 h-20 mx-auto bg-[#EE7623] rounded-full flex items-center justify-center">
                <Trophy className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-black text-gray-900">
                3. Sfila in <span className="text-[#EE7623]">passerella</span>
              </h3>
              <p className="text-lg text-gray-600 font-light">
                Con i <span className="font-bold">cappottini Ferribiella</span>: super premio per i primi 3 classificati.
              </p>
            </div>
          </div>

          <div className="text-center mt-12">
            <Button
              onClick={scrollToForm}
              size="lg"
              variant="outline"
              className="w-full max-w-md mx-auto border-2 border-[#6ABF4B] text-[#6ABF4B] hover:bg-[#6ABF4B] hover:text-white text-lg py-6 rounded-full transition-all duration-300 hover:scale-105"
            >
              Prenota ora
            </Button>
          </div>
        </div>
      </section>

      <section id="registration-form" className="py-16 md:py-24 px-4 bg-gradient-to-b from-orange-50 to-green-50">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12">
            <div className="text-left md:text-center mb-8">
              <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4 drop-shadow-[0_2px_4px_rgba(0,0,0,0.1)]">
                Registrati ora
              </h2>
              <p className="text-lg text-gray-600">
                Compila il modulo per partecipare alla Sfilata dei Cuccioli
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-lg">
                    Nome *
                  </Label>
                  <Input
                    id="firstName"
                    required
                    value={formData.firstName}
                    onChange={(e) =>
                      setFormData({ ...formData, firstName: e.target.value })
                    }
                    className="text-lg py-6 rounded-xl"
                    placeholder="Il tuo nome"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-lg">
                    Cognome *
                  </Label>
                  <Input
                    id="lastName"
                    required
                    value={formData.lastName}
                    onChange={(e) =>
                      setFormData({ ...formData, lastName: e.target.value })
                    }
                    className="text-lg py-6 rounded-xl"
                    placeholder="Il tuo cognome"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="city" className="text-lg">
                  Città di residenza *
                </Label>
                <Input
                  id="city"
                  required
                  value={formData.city}
                  onChange={(e) =>
                    setFormData({ ...formData, city: e.target.value })
                  }
                  className="text-lg py-6 rounded-xl"
                  placeholder="La tua città"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-lg">
                  Email *
                </Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="text-lg py-6 rounded-xl"
                  placeholder="tua@email.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-lg">
                  Cellulare *
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="text-lg py-6 rounded-xl"
                  placeholder="+39 123 456 7890"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dogBreed" className="text-lg">
                  Razza del cane *
                </Label>
                <Input
                  id="dogBreed"
                  required
                  maxLength={100}
                  value={formData.dogBreed}
                  onChange={(e) => setFormData({ ...formData, dogBreed: e.target.value })}
                  className="text-lg py-6 rounded-xl"
                  placeholder="Es. Labrador, Bassotto o Meticcio"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="participants" className="text-lg">
                  Numero partecipanti *
                </Label>
                <select
                  id="participants"
                  value={participants}
                  onChange={(e) => setParticipants(parseInt(e.target.value))}
                  required
                  className="w-full text-lg py-6 px-4 border-2 border-gray-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#EE7623] focus:border-transparent"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>

              <p className="text-gray-600 rounded-xl bg-orange-50 p-4">
                Sabato 17 ottobre 2026 · dalle 15:00 alle 18:00
              </p>

              <div className="flex items-start space-x-3 p-4 rounded-xl bg-gray-50">
                <Checkbox
                  id="privacy"
                  checked={formData.privacyAccepted}
                  onCheckedChange={(checked) =>
                    setFormData({
                      ...formData,
                      privacyAccepted: checked === true,
                    })
                  }
                  className="mt-1"
                />
                <Label
                  htmlFor="privacy"
                  className="text-sm text-gray-700 leading-relaxed cursor-pointer"
                >
                  Accetto la privacy policy e il trattamento dei miei dati personali *
                </Label>
              </div>

              {error && (
                <div className="p-4 rounded-xl bg-red-50 border border-red-200">
                  <p className="text-red-600 text-center">{error}</p>
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                size="lg"
                className="w-full bg-[#EE7623] hover:bg-[#d66a1f] text-white text-xl py-6 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
              >
                {loading ? 'Registrazione in corso...' : 'Conferma la registrazione'}
              </Button>
            </form>
          </div>
        </div>
      </section>

      <footer className="py-12 px-4 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto text-left md:text-center space-y-4">
          <p className="text-lg">
            Zooplanet Lacchiarella
          </p>
          <p className="text-gray-400">
            Sfilata dei Cuccioli · Sabato 17 ottobre 2026 · 15:00–18:00 · Ferribiella
          </p>
        </div>
      </footer>

      <div className="md:hidden fixed bottom-0 left-0 right-0 p-4 bg-white border-t-2 border-[#EE7623] shadow-2xl z-50">
        <Button
          onClick={scrollToForm}
          size="lg"
          className="w-full bg-[#EE7623] hover:bg-[#d66a1f] text-white text-lg py-6 rounded-full shadow-xl"
        >
          Non perdertelo
        </Button>
      </div>
    </main>
  );
}
