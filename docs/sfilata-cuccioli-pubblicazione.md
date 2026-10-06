# Sfilata dei cuccioli — passaggio per la pubblicazione

La landing presenta l’evento del 17 ottobre a Zooplanet Lacchiarella, in collaborazione con Ferribiella: cappottini, premi per i primi 3 classificati, -20% su tutti i prodotti, omaggi e gadget per tutti. La locandina fornita è in `public/sfilata-cuccioli-17-ottobre.jpg`.

## Prima del deploy in produzione

1. Applicare su Supabase la migration `supabase/migrations/20261006193000_add_dog_breed.sql`. Il form richiede `dog_breed` e lo invia sia al database sia al webhook. La colonna è nullable per preservare le iscrizioni precedenti.
2. Verificare che il progetto Vercel abbia `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` corretti. Non sono presenti nella copia locale.
3. Il database esistente impone unicità globale sull’email: decidere come consentire ai partecipanti degli eventi precedenti di iscriversi al nuovo evento, preservando i dati esistenti. Non è stata modificata questa regola né cancellata alcuna iscrizione.
4. Aggiornare il workflow n8n collegato al webhook esistente `zooplanet/registration-confirmation`: testi e data del nuovo evento, gestione della razza del cane. URL e autenticazione del webhook sono rimasti invariati. Confermare che accetti `dog_breed`.
5. Confermare l’orario: la locandina non lo indica. La pagina mostra che sarà confermato prossimamente e il payload invia `time_slot: "Da confermare"`. Aggiornare pagina e workflow quando si conosce l’orario.
6. Eseguire un’iscrizione completa con un indirizzo di prova autorizzato: verificare salvataggio di `dog_breed`, pagina di conferma ed email ricevuta con informazioni corrette.

## Modifiche incluse

- Nuovi testi in landing, conferma iscrizione, condivisione WhatsApp e metadati social.
- Locandina visualizzata interamente in formato quadrato.
- Campo obbligatorio “Razza del cane”, con esempio che include “meticcio” e controllo sul valore non vuoto.
- Rimossi foto gratuita, anniversario e promessa del gadget legato a tre inviti, non presenti nella nuova locandina. La funzionalità del link personale è mantenuta.

## Verifiche effettuate

- `npm run typecheck`: passato.
- `npm run build`: passato, con avvisi delle dipendenze esistenti.
- Anteprima verificata nel browser; home e pagina di conferma rispondono HTTP 200.
- Nessuna iscrizione reale o email di prova inviata: accessi Supabase e n8n non disponibili.

La produzione esistente è gestita su Vercel nell’account di Ale; questa pull request consegna il codice e la migration, senza applicare modifiche al database o al workflow email.
