import { PlaceholderScreen } from '@/components/placeholder-screen';

export default function HostDashboardScreen() {
  return (
    <PlaceholderScreen
      title="Dashboard Διοργανώτριας"
      subtitle="Host mode"
      body={
        'Τα tabs Επισκόπηση, Events, Πληρωμές και Reviews έρχονται στο βήμα 9 του roadmap, ' +
        'μαζί με τη σύνδεση λογαριασμού πληρωμών.'
      }
    />
  );
}
