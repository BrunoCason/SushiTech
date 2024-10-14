import { useState, useEffect } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebaseAuth'; // Atualize o caminho conforme necessário
import ProfileSettingsForm from '../Components/ProfileSettings/ProfileSettingsForm';

const ProfileSettings = () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (authUser) => {
      setUser(authUser);
    });

    return () => unsubscribe();
  }, []);

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <ProfileSettingsForm user={user} />
    </div>
  );
};

export default ProfileSettings;
