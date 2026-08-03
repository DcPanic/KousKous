import { PlaceholderScreen } from '@/components/placeholder-screen';

export default function CreatePostScreen() {
  return (
    <PlaceholderScreen
      title="Δημιουργία"
      subtitle="Νέα δημοσίευση"
      body={
        'Η δημιουργία post (φωτογραφία, video, story, reel, voice) συνδέεται με το media storage ' +
        'στο επόμενο βήμα.'
      }
    />
  );
}
