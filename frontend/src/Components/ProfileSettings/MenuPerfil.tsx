import { useState } from "react";
import ProfileSettings from "../../Pages/ProfileSettings";
import CreateUser from "./CreateUser";
import UserListOverlay from "./UserListOverlay";
import { signOut } from "firebase/auth";
import { auth } from "../../firebaseAuth";
import { FaUser, FaUsers } from 'react-icons/fa';
import { FiLogOut } from "react-icons/fi";
import { HiUserAdd } from "react-icons/hi";

const MenuPerfil = () => {
  // Estado para controlar a seleção do menu
  const [activeComponent, setActiveComponent] = useState<string>("profileSettings");

  // Função para renderizar o componente de acordo com o menu selecionado
  const renderComponent = () => {
    switch (activeComponent) {
      case "profileSettings":
        return <ProfileSettings />;
      case "createUser":
        return <CreateUser />;
      case "userListOverlay":
        return (
          <UserListOverlay
            users={[]}
            onClose={function (): void {
              throw new Error("Function not implemented.");
            }}
          />
        );
      default:
        return <ProfileSettings />;
    }
  };

  const menuItems = [
    { id: "profileSettings", label: "Perfil", icon: <FaUser className="ml-6 mr-8 "/> },
    { id: "createUser", label: "Criar Usuário", icon: <HiUserAdd className="ml-6 mr-8 w-7 h-7"/> },
    { id: "userListOverlay", label: "Ver Usuários", icon: <FaUsers className="ml-6 mr-8 w-7 h-7"/> },
  ];

  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log("User logged out");
    } catch (error) {
      console.error("Error logging out: ", error);
    }
  };

  return (
    <div className="flex flex-col items-center sm:items-start sm:flex-row justify-center container mt-24 2xl:mt-40 xl:-ml-20 mb-10">
        <nav>
          <ul className=" font-inter text-xl font-bold w-60 h-80 bg-EBEBEB flex flex-col justify-center rounded-md mb-10">
            {menuItems.map((item, index) => (
              <li key={item.id} className="flex flex-col">
                <div className="flex items-center">
                  {activeComponent === item.id && (
                    <div className="w-2 h-4 bg-CC3333"></div>
                  )}
                  {item.icon}
                  <button
                    onClick={() => setActiveComponent(item.id)}
                    className={`${
                      activeComponent === item.id ? "text-CC3333" : ""
                    }`}
                  >
                    {item.label}
                  </button>
                </div>
                {/* Adiciona a linha de separação entre os itens, exceto no último */}
                {index < menuItems.length && (
                  <div className="border-b border-gray-300 mx-6 my-6"></div>
                )}
              </li>
            ))}
            <li onClick={handleLogout} className="cursor-pointer ml-2 flex items-center">
              <FiLogOut className="ml-4 mr-8 w-7 h-7" />
              Sair
            </li>
          </ul>
        </nav>
      <div className="sm:ml-10 lg:ml-32">
        {renderComponent()}
      </div>
    </div>
  );
};

export default MenuPerfil;
