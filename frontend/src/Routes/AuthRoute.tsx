import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { User } from "firebase/auth";
import { auth } from "../firebaseAuth";

const AuthRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((authUser) => {
      setUser(authUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) return null;
  return user ? <Navigate to="/" replace /> : <>{children}</>;
};

export default AuthRoute;
