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
    <main className="min-h-screen bg-gradient-to-b from-orange-50 via-white to-green-50">
      <section className="relative min-h-[95vh] flex flex-col items-center justify-center px-4 py-20 md:py-32">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNFRTc2MjMiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE0YzAgNC40MTgtMy41ODIgOC04IDhzLTgtMy41ODItOC04IDMuNTgyLTggOC04IDggMy41ODIgOCA4eiIvPjwvZz48L2c+PC9zdmc+')] opacity-40"></div>

        <div className="relative z-10 max-w-5xl mx-auto text-left md:text-center space-y-10">
          <h1 className="text-7xl md:text-9xl lg:text-[12rem] font-black text-gray-900 leading-[1.1] tracking-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.1)]">
            Natale con i{' '}
            <span className="text-red-600 drop-shadow-lg">Cuccioli</span>
          </h1>

          <p className="text-2xl md:text-3xl lg:text-4xl text-gray-700 max-w-3xl mx-auto md:mx-auto font-medium">
            L'evento più dolce dell'anno a Zooplanet Pantigliate
          </p>

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
              <h3 className="text-2xl font-black text-gray-900">1. Registrati</h3>
              <p className="text-lg text-gray-600">
                Scegli gratuitamente la tua fascia oraria preferita
              </p>
            </div>

            <div className="text-center space-y-4 p-8 rounded-3xl bg-gradient-to-br from-green-50 to-white hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="w-20 h-20 mx-auto bg-[#6ABF4B] rounded-full flex items-center justify-center">
                <Gift className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-black text-gray-900">2. Vieni da noi</h3>
              <p className="text-lg text-gray-600">
                Via dei Rioni 13, Pantigliate. Ti aspettano dolci natalizi!
              </p>
            </div>

            <div className="text-left md:text-center space-y-4 p-8 rounded-3xl bg-gradient-to-br from-orange-50 to-white hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="w-20 h-20 mx-auto bg-[#EE7623] rounded-full flex items-center justify-center">
                <Camera className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-black text-gray-900">3. Scatta la foto</h3>
              <p className="text-lg text-gray-600">
                Ricordo di Natale con i cuccioli (pacchetto completo acquistabile)
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
              Prenota ora il tuo posto
            </Button>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 px-4 bg-gradient-to-b from-white to-orange-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-black text-center text-gray-900 mb-16 drop-shadow-[0_2px_4px_rgba(0,0,0,0.1)]">
            6 motivi per partecipare
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start space-x-4 p-6 rounded-2xl bg-white hover:shadow-lg transition-all duration-300">
              <Sparkles className="w-8 h-8 text-[#EE7623] flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-black text-gray-900 mb-2">
                  Esperienza unica
                </h3>
                <p className="text-gray-600">
                  Un evento magico a tema cuccioli che non dimenticherai
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4 p-6 rounded-2xl bg-white hover:shadow-lg transition-all duration-300">
              <Heart className="w-8 h-8 text-[#6ABF4B] flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-black text-gray-900 mb-2">
                  Perfetto per famiglie
                </h3>
                <p className="text-gray-600">
                  Bambini e adulti si divertiranno insieme ai cuccioli
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4 p-6 rounded-2xl bg-white hover:shadow-lg transition-all duration-300">
              <Camera className="w-8 h-8 text-[#EE7623] flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-black text-gray-900 mb-2">
                  Foto natalizia
                </h3>
                <p className="text-gray-600">
                  Il ricordo perfetto delle tue feste con i cuccioli
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4 p-6 rounded-2xl bg-white hover:shadow-lg transition-all duration-300">
              <Gift className="w-8 h-8 text-[#6ABF4B] flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-black text-gray-900 mb-2">
                  Dolci natalizi offerti
                </h3>
                <p className="text-gray-600">
                  Prelibatezze per rendere l'esperienza ancora più dolce
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4 p-6 rounded-2xl bg-white hover:shadow-lg transition-all duration-300">
              <Users className="w-8 h-8 text-[#EE7623] flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-black text-gray-900 mb-2">
                  Posti limitati
                </h3>
                <p className="text-gray-600">
                  La registrazione è necessaria per garantire un'esperienza di qualità
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4 p-6 rounded-2xl bg-white hover:shadow-lg transition-all duration-300">
              <Sparkles className="w-8 h-8 text-[#6ABF4B] flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-black text-gray-900 mb-2">
                  Evento gratuito
                </h3>
                <p className="text-gray-600">
                  L'accesso è completamente gratuito, basta registrarsi
                </p>
              </div>
            </div>
          </div>

          <div className="text-center mt-12">
            <Button
              onClick={scrollToForm}
              size="lg"
              className="w-full max-w-md mx-auto bg-[#6ABF4B] hover:bg-[#5ba942] text-white text-lg py-6 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
            >
              Riserva gratuitamente il tuo accesso
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
