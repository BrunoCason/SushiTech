import { useState, useEffect } from "react";
import { Outlet, Navigate, useParams } from "react-router-dom";
import { User } from "firebase/auth";
import { auth } from "../firebaseAuth";

const PrivateRoute = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Extrai o parâmetro 'id' da URL, que pode ser usado para identificar uma mesa ou outra rota
  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((authUser) => {
      setUser(authUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) return null;

  // Se o usuário não estiver autenticado, redireciona para a página de login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Verifica se o usuário é um "usuário de mesa" pelo e-mail
  const isTableUser = user.email?.startsWith("mesa");
  if (isTableUser) {
    // Extrai o número da mesa do e-mail
    const tableNumber = user.email?.split("@")[0].replace("mesa", "");

    // Verifica se está tentando acessar uma rota que não corresponde ao número da sua própria mesa
    if (!tableNumber || tableNumber !== id) {
      return <Navigate to={`/start/${tableNumber}`} replace />;
    }
  } else {
    // Se o usuário não for de mesa, permite o acesso às outras rotas
    return <Outlet />;
  }
  return <Outlet />;
};

export default PrivateRoute;
