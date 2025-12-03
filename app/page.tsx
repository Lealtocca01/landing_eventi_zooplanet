'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { getSupabase } from '@/lib/supabase';
import { Heart, Calendar, Camera, Gift, Users, Sparkles } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';

export default function Home() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const referredByFromUrl =
    searchParams.get('code') || searchParams.get('ref') || '';

  const [participants, setParticipants] = useState<number>(1);
  const [timeSlot, setTimeSlot] = useState<string>("15:00 - 16:00");
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    city: '',
    email: '',
    phone: '',
    timeSlot: '',
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
        participants: participants,
        time_slot: timeSlot,
        referred_by: formData.referredBy?.trim() || null,
        privacy_accepted: !!formData.privacyAccepted,
      };

      console.log("Payload to Supabase:", clean);

      // INSERT
      const { data, error: insertError } = await supabase
        .from('registrations')
        .insert([clean])
        .select()
        .maybeSingle();

      console.log("Insert result:", { data, insertError });

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
            'https://twipagency.app.n8n.cloud/webhook/zooplanet/registration-confirmation',
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'X-Webhook-Token': 'zooplanet_2025_secret_abc123',
              },
              body: JSON.stringify({
                registration_id: data.id,
                email: data.email,
                referral_code: data.referral_code,
                first_name: formData.firstName,
                last_name: formData.lastName,
                phone: formData.phone,
                participants,
                time_slot: timeSlot,
              }),
            }
          );
        } catch (webhookError) {
          console.error('Webhook Error:', webhookError);
        }
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
      <section className="relative min-h-[95vh] flex flex-col items-center justify-center px-6 md:px-8 lg:px-12 py-20 md:py-32">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNFRTc2MjMiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE0YzAgNC40MTgtMy41ODIgOC04IDhzLTgtMy41ODItOC04IDMuNTgyLTggOC04IDggMy41ODIgOCA4eiIvPjwvZz48L2c+PC9zdmc+')] opacity-40"></div>

        <div className="relative z-10 max-w-5xl mx-auto text-left md:text-center space-y-10 w-full px-3 sm:px-4 md:px-0">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl 2xl:text-9xl font-black text-gray-900 leading-[1.1] tracking-[-0.02em] drop-shadow-[0_3px_6px_rgba(0,0,0,0.2)] break-words [-webkit-text-stroke:1px_rgba(0,0,0,0.05)]">
            Un Natale
            <br />
            <span className="text-red-600 drop-shadow-[0_6px_12px_rgba(238,118,35,0.5)] font-black [-webkit-text-stroke:2px_rgba(0,0,0,0.2)] text-5xl sm:text-6xl md:text-8xl lg:text-9xl xl:text-[11rem] 2xl:text-[12rem]">Indimenticabile</span>
          </h1>

          <div className="space-y-3 text-xl md:text-2xl lg:text-3xl text-gray-700 max-w-3xl mx-auto md:mx-auto">
            <p className="font-light">
              Con la tua <span className="font-black text-gray-900">famiglia</span>. Con i tuoi <span className="font-black text-gray-900">bambini</span>. Con i <span className="font-black text-gray-900">cuccioli</span>.
            </p>
            <p className="text-[#EE7623] font-bold text-2xl md:text-3xl lg:text-4xl">
              Un <span className="font-black italic">ricordo</span> dolce che conserverai <span className="font-black">per sempre</span>.
            </p>
          </div>

          <div className="relative w-full max-w-2xl mx-auto rounded-3xl overflow-hidden shadow-2xl my-8 transition-transform hover:scale-105 duration-300">
            <div className="aspect-[3/4] md:aspect-[2/3] lg:aspect-[3/4] relative">
              <Image
                src="/57431da6-bdd7-4d64-b31a-817e1d00b090.JPG"
                alt="Natale con i Cuccioli - Zooplanet Pantigliate"
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
            Riserva il tuo accesso gratuito
          </Button>
        </div>
      </section>

      <section className="py-16 md:py-24 px-4 bg-gradient-to-b from-white to-orange-50 relative overflow-hidden">
        {/* Accenti natalizi discreti */}
        <div className="absolute top-10 left-10 text-[#EE7623] opacity-20 text-4xl animate-pulse">❄️</div>
        <div className="absolute top-20 right-20 text-[#6ABF4B] opacity-20 text-3xl animate-pulse delay-300">✨</div>
        <div className="absolute bottom-20 left-20 text-[#EE7623] opacity-20 text-3xl animate-pulse delay-700">🎄</div>
        
        <div className="max-w-6xl mx-auto relative z-10">
          <h2 className="text-4xl md:text-5xl font-black text-center text-gray-900 mb-16 drop-shadow-[0_2px_4px_rgba(0,0,0,0.1)]">
            <span className="text-[#EE7623]">6 motivi</span> per cui <span className="italic">non puoi mancare</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Card 1: Esperienza unica - con immagine */}
            <div className="relative rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] group">
              <div className="relative h-48 md:h-56">
                <Image
                  src="/whatsapp-preview-final.jpg"
                  alt="Esperienza unica con cuccioli natalizi"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#EE7623]/90 via-[#EE7623]/70 to-transparent"></div>
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-6 h-6 text-white" />
                    <h3 className="text-2xl font-black">
                      Un <span className="text-yellow-300">ricordo</span> fantastico <span className="italic">per sempre</span>
                    </h3>
                  </div>
                  <p className="text-white/95 text-sm md:text-base font-light">
                    Una <span className="font-bold">foto speciale</span>, un <span className="italic">momento unico</span> con la tua <span className="font-bold">famiglia</span>.
                  </p>
                </div>
              </div>
            </div>

            {/* Card 2: Perfetto per famiglie - con immagine */}
            <div className="relative rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] group">
              <div className="relative h-48 md:h-56">
                <Image
                  src="/Gemini_Generated_Image_tpo4mtpo4mtpo4mt.png"
                  alt="Perfetto per famiglie"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#6ABF4B]/90 via-[#6ABF4B]/70 to-transparent"></div>
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <div className="flex items-center gap-2 mb-2">
                    <Heart className="w-6 h-6 text-white" />
                    <h3 className="text-2xl font-black">
                      I tuoi <span className="text-yellow-300">bambini</span> lo ameranno
                    </h3>
                  </div>
                  <p className="text-white/95 text-sm md:text-base font-light">
                    Un'<span className="font-bold">esperienza</span> <span className="italic">tenera</span> e <span className="font-bold">divertente</span>.
                  </p>
                </div>
              </div>
            </div>

            {/* Card 3: Foto natalizia - con immagine */}
            <div className="relative rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] group">
              <div className="relative h-48 md:h-56">
                <Image
                  src="/Festive Pups with Holiday Treats.png"
                  alt="Foto natalizia con cuccioli"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#6ABF4B]/90 via-[#6ABF4B]/70 to-transparent"></div>
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <div className="flex items-center gap-2 mb-2">
                    <Camera className="w-6 h-6 text-white" />
                    <h3 className="text-2xl font-black">
                      Vivrai l'<span className="text-yellow-300 italic">atmosfera</span> unica del <span className="text-yellow-300">Natale</span>
                    </h3>
                  </div>
                  <p className="text-white/95 text-sm md:text-base">
                    Luci, dolci, profumi, emozioni vere.
                  </p>
                </div>
              </div>
            </div>

            {/* Card 4: Dolci natalizi offerti - con immagine */}
            <div className="relative rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] group">
              <div className="relative h-48 md:h-56">
                <Image
                  src="/Gemini_Generated_Image_v2cdblv2cdblv2cd.png"
                  alt="Dolci natalizi offerti"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#6ABF4B]/90 via-[#6ABF4B]/70 to-transparent"></div>
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <div className="flex items-center gap-2 mb-2">
                    <Gift className="w-6 h-6 text-white" />
                    <h3 className="text-2xl font-black">Gusterai tante delizie natalizie</h3>
                  </div>
                  <p className="text-white/95 text-sm md:text-base font-light">
                    Il <span className="font-bold">Natale</span> in ogni <span className="italic">dettaglio</span>.
                  </p>
                </div>
              </div>
            </div>

            {/* Card 5: Posti limitati - con immagine */}
            <div className="relative rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] group">
              <div className="relative h-48 md:h-56">
                <Image
                  src="/Gemini_Generated_Image_v4hhqzv4hhqzv4hh.png"
                  alt="Posti limitati"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#EE7623]/90 via-[#EE7623]/70 to-transparent"></div>
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-6 h-6 text-white" />
                    <h3 className="text-2xl font-black">
                      <span className="text-yellow-300">Posti limitati</span>: non perdertelo
                    </h3>
                  </div>
                  <p className="text-white/95 text-sm md:text-base font-light">
                    È un <span className="font-bold">evento unico</span> nel suo <span className="italic">genere</span>.
                  </p>
                </div>
              </div>
            </div>

            {/* Card 6: Evento gratuito - con immagine */}
            <div className="relative rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] group">
              <div className="relative h-48 md:h-56">
                <Image
                  src="/Gemini_Generated_Image_up021hup021hup02.png"
                  alt="Evento gratuito natalizio"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#EE7623]/90 via-[#EE7623]/70 to-transparent"></div>
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-6 h-6 text-white" />
                    <h3 className="text-2xl font-black">
                      È <span className="text-yellow-300 text-3xl">gratuito</span>
                    </h3>
                  </div>
                  <p className="text-white/95 text-sm md:text-base font-light">
                    E puoi anche ottenere la <span className="font-black text-lg">foto gratis</span> invitando <span className="font-bold">3 amici</span>.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mt-12">
            <Button
              onClick={scrollToForm}
              size="lg"
              className="w-full max-w-md mx-auto bg-[#6ABF4B] hover:bg-[#5ba942] text-white text-lg py-6 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
            >
              Riserva il tuo posto
            </Button>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-black text-center text-gray-900 mb-16 drop-shadow-[0_2px_4px_rgba(0,0,0,0.1)]">
            Come funziona l'evento
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center space-y-4 p-8 rounded-3xl bg-gradient-to-br from-orange-50 to-white hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="w-20 h-20 mx-auto bg-[#EE7623] rounded-full flex items-center justify-center">
                <Calendar className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-black text-gray-900">
                1. Registrati <span className="text-[#EE7623]">gratuitamente</span>
              </h3>
              <p className="text-lg text-gray-600 font-light">
                Riserva il tuo <span className="font-semibold">posto</span> e scegli la <span className="italic">fascia oraria</span>.
              </p>
            </div>

            <div className="text-center space-y-4 p-8 rounded-3xl bg-gradient-to-br from-green-50 to-white hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="w-20 h-20 mx-auto bg-[#6ABF4B] rounded-full flex items-center justify-center">
                <Gift className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-black text-gray-900">
                2. Vivi l'<span className="text-[#EE7623] italic">atmosfera</span> più dolce del Natale
              </h3>
              <p className="text-lg text-gray-600 font-light">
                <span className="font-bold">Cuccioli</span>, <span className="font-semibold">pandoro</span>, <span className="font-semibold">panettone</span>, <span className="italic">cioccolata calda</span>.
              </p>
            </div>

            <div className="text-center space-y-4 p-8 rounded-3xl bg-gradient-to-br from-orange-50 to-white hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="w-20 h-20 mx-auto bg-[#EE7623] rounded-full flex items-center justify-center">
                <Camera className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-black text-gray-900">
                3. Scatta la tua <span className="text-[#EE7623]">foto natalizia</span>
              </h3>
              <p className="text-lg text-gray-600 font-light">
                Un <span className="font-bold">ricordo</span> che <span className="italic font-semibold">scalda davvero il cuore</span>.
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
                Compila il modulo per riservare il tuo posto gratuito
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

              <div className="space-y-2">
                <Label htmlFor="timeSlot" className="text-lg">
                  Fascia oraria *
                </Label>
                <select
                  id="timeSlot"
                  value={timeSlot}
                  onChange={(e) => setTimeSlot(e.target.value)}
                  required
                  className="w-full text-lg py-6 px-4 border-2 border-gray-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#EE7623] focus:border-transparent"
                >
                  {[
                    "15:00 - 16:00",
                    "16:00 - 17:00",
                    "17:00 - 18:00",
                    "18:00 - 19:00",
                    "19:00 - 20:00",
                  ].map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

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
            Zooplanet Pantigliate • Via dei Rioni 13, Pantigliate (MI)
          </p>
          <p className="text-gray-400">
            Natale con i Cuccioli - Evento gratuito a posti limitati
          </p>
        </div>
      </footer>

      <div className="md:hidden fixed bottom-0 left-0 right-0 p-4 bg-white border-t-2 border-[#EE7623] shadow-2xl z-50">
        <Button
          onClick={scrollToForm}
          size="lg"
          className="w-full bg-[#EE7623] hover:bg-[#d66a1f] text-white text-lg py-6 rounded-full shadow-xl"
        >
          Riserva ora
        </Button>
      </div>
    </main>
  );
}
