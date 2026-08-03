export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export interface HostApplication {
  id: string;
  name: string;
  email: string;
  city: string;
  proposedEvents: string;
  submittedAt: string;
  status: ApprovalStatus;
  /** Set by the payment provider webhook, independent of approval. */
  paymentVerified: boolean;
}

/** Placeholder rows until the admin API is connected to Supabase. */
export const hostApplications: HostApplication[] = [
  {
    id: 'ha_1',
    name: 'Νατάσα Ιωάννου',
    email: 'natasa@example.com',
    city: 'Αθήνα',
    proposedEvents: 'Yoga & pilates σε εξωτερικούς χώρους',
    submittedAt: '2026-07-28',
    status: 'pending',
    paymentVerified: false,
  },
  {
    id: 'ha_2',
    name: 'Μαρίνα Χατζή',
    email: 'marina@example.com',
    city: 'Λεμεσός',
    proposedEvents: 'Wine tastings & supper clubs',
    submittedAt: '2026-07-30',
    status: 'pending',
    paymentVerified: true,
  },
  {
    id: 'ha_3',
    name: 'Ελένη Βασιλείου',
    email: 'eleni@example.com',
    city: 'Θεσσαλονίκη',
    proposedEvents: 'Book club & creative writing workshops',
    submittedAt: '2026-07-19',
    status: 'approved',
    paymentVerified: true,
  },
];

export const platformStats = [
  { label: 'Συνολικά μέλη', value: '48.240' },
  { label: 'Νέα μέλη (μήνα)', value: '1.842' },
  { label: 'Ενεργές συνδρομές', value: '6.310' },
  { label: 'Εκκρεμείς αιτήσεις host', value: '2' },
];
