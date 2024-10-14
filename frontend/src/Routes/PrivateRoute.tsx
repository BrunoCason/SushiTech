import React, { useState, useEffect } from "react";
import { Outlet, Navigate, useParams } from "react-router-dom";
import { User } from "firebase/auth";
import { auth } from "../firebaseAuth";

const PrivateRoute: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((authUser) => {
      setUser(authUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) return null;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Verifica se o e-mail do usuário começa com 'table' e restringe o acesso
  const isTableUser = user.email?.startsWith('table');
  if (isTableUser) {
    const tableNumber = user.email?.split('@')[0].replace('table', '');

    // Verifica se o usuário está tentando acessar uma rota que não é a sua própria mesa
    if (!tableNumber || tableNumber !== id) {
      return <Navigate to={`/table/${tableNumber}`} replace />;
    }
  } else {
    // Se o usuário não é um usuário de mesa, permitir acesso a outras rotas
    return <Outlet />;
  }

  return <Outlet />;
};

export default PrivateRoute;