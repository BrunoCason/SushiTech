import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebaseAuth";
import { getUserRole } from "../Services/roleService";
import PageTitle from "./PageTitle";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const LoginConfig: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;
      const role = await getUserRole(uid);
      
      if (role) {
        navigate("/", { state: { role } });
      } else {
        setError("User role not found");
      }
    } catch (error) {
      console.error("Error when logging in with Email and Password:", error);
      setError("Senha incorreta");
    }
  };

  return (
    <section className="bg-gray-200 min-h-screen flex items-center justify-center">
      <PageTitle title="Login" />
      <main className="w-full max-w-md p-6 bg-white rounded-lg shadow-xl">
        <h2 className="text-3xl font-bold text-center mb-6">Login</h2>
        <form onSubmit={handleEmailLogin} className="flex flex-col">
          <input
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mb-4 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="relative mb-6">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              {showPassword ? (
                <FaEyeSlash className="h-5 w-5 text-gray-500" />
              ) : (
                <FaEye className="h-5 w-5 text-gray-500" />
              )}
            </button>
            {error && (
              <p className="text-red-500 text-sm absolute top-full mt-1">{error}</p>
            )}
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors"
          >
            Login
          </button>
        </form>
      </main>
    </section>
  );
};

export default LoginConfig;
