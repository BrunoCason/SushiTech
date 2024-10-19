import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { User, signOut } from "firebase/auth";
import { FaUser, FaBars, FaTimes } from "react-icons/fa";
import { auth } from "../firebaseAuth";

interface HeaderProps {
  user?: User;
}

const Header = ({ user }: HeaderProps) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log("User logged out");
    } catch (error) {
      console.error("Error logging out: ", error);
    }
  };

  useEffect(() => {
    setMenuOpen(false);
    setMobileMenuOpen(false); // Fechar o menu mobile ao mudar de rota
  }, [location]);

  return (
    <header className="bg-DEDEDE text-black text-base font-bold font-inter px-8 py-4 fixed w-full top-0 z-30">
      <nav className="container mx-auto flex justify-between items-center px-4 sm:px-0">
        <Link to="/">
          <img
            className="w-36 -ml-5 sm:-ml-0 cursor-pointer"
            src="https://firebasestorage.googleapis.com/v0/b/tg-fatec-cfd4a.appspot.com/o/logos%2FTech-escrito.png?alt=media&token=e17143b7-f599-41d9-9c85-ce3f8508645e"
            alt="logo"
          />
        </Link>

        {/* Menu para Mobile */}
        <div className="sm:hidden flex items-center">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-black text-2xl"
          >
            {mobileMenuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>

        {/* Menu para Desktop */}
        <ul className="hidden sm:flex space-x-10 items-center">
          <li>
            <Link to="/tables" className="hover:text-gray-600">
              Mesas
            </Link>
          </li>
          <li>
            <Link to="/" className="hover:text-gray-600">
              Produtos
            </Link>
          </li>
          <li>
            <Link to="/orders" className="hover:text-gray-600">
              Pedidos
            </Link>
          </li>
          {user && (
            <li className="relative">
              <div
                className="flex items-center space-x-2 cursor-pointer"
                onClick={() => setMenuOpen(!menuOpen)}
              >
                <FaUser className="text-xl text-CC3333" />
              </div>
              {menuOpen && (
                <div className="absolute right-0 mt-2 bg-white text-black rounded-lg shadow-lg w-48">
                  <ul>
                    <li>
                      <Link
                        to="/profile-settings"
                        className="block px-4 py-2 hover:bg-gray-200 hover:rounded-t-lg"
                      >
                        Configurações
                      </Link>
                    </li>
                    <li>
                      <button
                        onClick={handleLogout}
                        className="block px-4 py-2 w-full text-left hover:bg-gray-200 hover:rounded-b-lg"
                      >
                        Logout
                      </button>
                    </li>
                  </ul>
                </div>
              )}
            </li>
          )}
        </ul>
      </nav>

      {/* Overlay escuro */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20"
          onClick={() => setMobileMenuOpen(false)}
        ></div>
      )}

      {/* Menu Mobile (sm ou menor) */}
      {mobileMenuOpen && (
        <div className="sm:hidden fixed top-0 right-0 w-64 h-full bg-DEDEDE p-4 z-30 flex items-center justify-center">
          <ul className="space-y-4 text-center">
            <li>
              <Link to="/tables" className="hover:text-gray-600 block">
                Mesas
              </Link>
            </li>
            <li>
              <Link to="/" className="hover:text-gray-600 block">
                Produtos
              </Link>
            </li>
            <li>
              <Link to="/orders" className="hover:text-gray-600 block">
                Pedidos
              </Link>
            </li>
            <li>
              <Link
                to="/profile-settings"
                className="hover:text-gray-600 block"
              >
                Configurações
              </Link>
            </li>
            {user && (
              <li>
                <button
                  onClick={handleLogout}
                  className="block w-full hover:text-gray-600 mt-10"
                >
                  Logout
                </button>
              </li>
            )}
          </ul>
        </div>
      )}
    </header>
  );
};

export default Header;
