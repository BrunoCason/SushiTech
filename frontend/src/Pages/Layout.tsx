import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../Components/Header';
import { auth } from '../firebaseAuth';
import { User } from 'firebase/auth';

const Layout: React.FC = () => {
  const [user, setUser] = useState<User | undefined>(undefined); // Ajuste o estado para User | undefined

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((authUser) => {
      setUser(authUser ?? undefined); // Se authUser for null, defina como undefined
    });
    return () => unsubscribe();
  }, []);

  return (
    <div>
      <Header user={user} />
      <main className="container mx-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
