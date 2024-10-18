import { useState, useEffect } from "react";
import ProfileSettings from "../../Pages/ProfileSettings";
import CreateUser from "./CreateUser";
import UserListOverlay from "./UserListOverlay";
import { signOut } from "firebase/auth";
import { auth } from "../../firebaseAuth";
import { FaUser, FaUsers } from "react-icons/fa";
import { FiLogOut } from "react-icons/fi";
import { HiUserAdd } from "react-icons/hi";
import { getUserRole } from "../../Services/roleService";

const MenuPerfil = () => {
  const [activeComponent, setActiveComponent] =
    useState<string>("profileSettings");
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  useEffect(() => {
    const fetchUserRole = async () => {
      const uid = auth.currentUser?.uid; // Obtém o UID do usuário autenticado

      if (uid) {
        // Verifica se uid não é undefined
        const role = await getUserRole(uid); // Chama a função apenas se uid estiver definido
        setIsAdmin(role === "admin"); // Define isAdmin com base na role
      } else {
        setIsAdmin(false); // Se não houver usuário autenticado, não é admin
      }
    };

    fetchUserRole();
  }, []);

  const renderComponent = () => {
    switch (activeComponent) {
      case "profileSettings":
        return <ProfileSettings />;
      case "createUser":
        return isAdmin ? <CreateUser /> : <ProfileSettings />;
      case "userListOverlay":
        return isAdmin ? (
          <UserListOverlay
            users={[]}
            onClose={function (): void {
              throw new Error("Function not implemented.");
            }}
          />
        ) : (
          <ProfileSettings />
        );
      default:
        return <ProfileSettings />;
    }
  };

  const menuItems = [
    {
      id: "profileSettings",
      label: "Perfil",
      icon: <FaUser className="ml-6 mr-8 " />,
    },
    ...(isAdmin
      ? [
          {
            id: "createUser",
            label: "Criar Usuário",
            icon: <HiUserAdd className="ml-6 mr-8 w-7 h-7" />,
          },
          {
            id: "userListOverlay",
            label: "Ver Usuários",
            icon: <FaUsers className="ml-6 mr-8 w-7 h-7" />,
          },
        ]
      : []),
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
              {index < menuItems.length && (
                <div className="border-b border-gray-300 mx-6 my-6"></div>
              )}
            </li>
          ))}
          <li
            onClick={handleLogout}
            className="cursor-pointer ml-2 flex items-center"
          >
            <FiLogOut className="ml-4 mr-8 w-7 h-7" />
            Sair
          </li>
        </ul>
      </nav>
      <div className="sm:ml-10 lg:ml-32">{renderComponent()}</div>
    </div>
  );
};

export default MenuPerfil;
