# KousKous

Premium γυναικεία κοινότητα για Ελλάδα & Κύπρο — social feed, θεματικά forums,
events και συνδρομητικά προνόμια.

## Δομή (npm workspaces monorepo)

```
apps/mobile      Expo (SDK 57) app — iOS + Android
apps/admin       Web admin panel — Vite + React
packages/shared  Design tokens, κατηγορίες, τοποθεσίες, types, feature gating
```

Το `packages/shared` καταναλώνεται ως TypeScript source από τα δύο apps, ώστε
χρώματα και κανόνες πρόσβασης να μην αποκλίνουν ποτέ μεταξύ mobile και admin.

## Προαπαιτούμενα

- Node.js 20+
- Το Expo Go στο κινητό (App Store / Play Store) για το mobile app

## Εγκατάσταση

```bash
npm install
```

Ένα install στο root αρκεί — καλύπτει και τα τρία workspaces.

## Τρέξιμο

### Mobile app σε Expo Go

```bash
npm run mobile
```

Σκάναρε το QR code που εμφανίζεται στο τερματικό με το Expo Go (Android) ή με
την κάμερα (iOS). Το κινητό και ο υπολογιστής πρέπει να είναι στο **ίδιο WiFi**.

Αν δεν βλέπεις το QR ή το κινητό δεν συνδέεται, δοκίμασε tunnel:

```bash
npm run mobile:tunnel
```

Για γρήγορο preview στον browser χωρίς κινητό:

```bash
npm run mobile:web
```

### Admin panel

```bash
npm run admin
```

Ανοίγει στο <http://localhost:5173>.

### Έλεγχοι

```bash
npm run typecheck
```

## Κατάσταση υλοποίησης

Υλοποιημένα:

- Design system από τα εγκεκριμένα mockups (χρώματα, Pacifico + Manrope, lucide icons)
- Bottom navigation με 5 στοιχεία και ανυψωμένο κεντρικό κουμπί
- Drawer menu με ομαδοποιημένες κατηγορίες και follow toggles
- Φίλτρα σε pop-up sheet: αναζήτηση τοποθεσίας με προτάσεις, εύρος ημερομηνιών,
  κατηγορία event, τιμή, διαθεσιμότητα
- Feed: stories, tabs, post cards, promo banners, δημιουργία δημοσίευσης με media
- Forums ανά κοινότητα, οθόνη συζήτησης με απαντήσεις, φωτογραφίες/βίντεο και αγαπημένα
- Events: λίστα, σελίδα event, δήλωση συμμετοχής
- Chat/DM: λίστα συνομιλιών και συνομιλία με media
- Ειδοποιήσεις, Rewards Club, Ρυθμίσεις
- Συνδρομή, ολοκλήρωση παραγγελίας και σελίδα Premium Host
- Δημιουργία event για διοργανώτριες
- Δημόσιο προφίλ άλλης χρήστριας
- Host Dashboard: Επισκόπηση, Events, Πληρωμές, Reviews — με δικό του bottom nav
- Official Dashboard: Επισκόπηση, Events, Rewards, Ανακοινώσεις
- Admin panel: επισκόπηση + ουρά εγκρίσεων host

Εκκρεμούν:

- Supabase auth, schema και πραγματικά δεδομένα — τώρα όλα είναι mock
- Stripe: συνδρομές μελών και Connect payouts για τις διοργανώτριες
- Αποθήκευση media (τώρα οι φωτογραφίες ζουν μόνο στη συσκευή για τη συνεδρία)

## Preview τύπων λογαριασμού

Μέχρι να μπει το auth, το drawer menu έχει στο κάτω μέρος έναν dev switcher
(**Free / Μέλος / Host / Official**) που αλλάζει τον τύπο λογαριασμού ώστε να
φαίνονται τα paywalls και τα dashboards χωρίς backend.
