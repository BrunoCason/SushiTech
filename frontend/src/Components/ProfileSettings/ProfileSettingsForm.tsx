import { useState, useEffect } from "react";
import {
  User,
  reauthenticateWithCredential,
  updatePassword,
  EmailAuthProvider,
} from "firebase/auth";
import { FaEye, FaEyeSlash, FaSpinner } from "react-icons/fa";
import PageTitle from "../PageTitle";
import {
  fetchUserProfile,
  updateUserProfile,
} from "../../Services/userService";
import { FaUserLarge } from "react-icons/fa6";
import { MdEmail } from "react-icons/md";
import { FaPhoneAlt } from "react-icons/fa";

interface ProfileSettingsFormProps {
  user: User; // Recebe o usuário como prop
}

const ProfileSettingsForm = ({ user }: ProfileSettingsFormProps) => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [currentPasswordError, setCurrentPasswordError] = useState<
    string | null
  >(null);
  const [newPasswordError, setNewPasswordError] = useState<string | null>(null);

  // Estados para nome e telefone
  const [name, setName] = useState<string>("");
  const [phone, setPhone] = useState<string>("");

  // Estados de erro para nome e telefone
  const [nameError, setNameError] = useState<boolean>(false);
  const [phoneError, setPhoneError] = useState<boolean>(false);

  // Armazena os valores iniciais do perfil
  const [initialName, setInitialName] = useState<string>("");
  const [initialPhone, setInitialPhone] = useState<string>("");

  // Estado de loading
  const [loading, setLoading] = useState(true); // Inicia como true para exibir o spinner no início

  useEffect(() => {
    const fetchUserProfileData = async () => {
      try {
        const profileData = await fetchUserProfile(user.uid);
        setName(profileData.name || "");
        setPhone(profileData.phone || "");

        // Define os valores iniciais para comparação posterior
        setInitialName(profileData.name || "");
        setInitialPhone(profileData.phone || "");
      } catch (error) {
        console.error("Erro ao buscar dados do perfil:", error);
      } finally {
        setLoading(false); // Desativa o loading após buscar os dados
      }
    };

    fetchUserProfileData();
  }, [user.uid]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPasswordError(null);
    setNewPasswordError(null);

    // Verifica se nome e telefone estão preenchidos
    let formIsValid = true;

    if (!name.trim()) {
      setNameError(true);
      formIsValid = false;
    } else {
      setNameError(false);
    }

    if (!phone.trim()) {
      setPhoneError(true);
      formIsValid = false;
    } else {
      setPhoneError(false);
    }

    if (!formIsValid) {
      return; // Para a execução caso algum campo esteja inválido
    }

    setLoading(true);

    if (newPassword && newPassword === currentPassword) {
      setNewPasswordError("A nova senha não pode ser a mesma que a atual");
      setLoading(false);
      return;
    }

    try {
      // Atualiza dados de perfil somente se houverem mudanças
      if (name !== initialName || phone !== initialPhone) {
        await updateUserProfile(user.uid, { name, phone });
      }

      // Se a nova senha for fornecida, atualiza a senha
      if (newPassword) {
        if (!user.email) {
          throw new Error("Email do usuário não disponível");
        }

        const credential = EmailAuthProvider.credential(
          user.email,
          currentPassword
        );
        await reauthenticateWithCredential(user, credential);
        await updatePassword(user, newPassword);
      }

      // Limpa os campos
      setCurrentPassword("");
      setNewPassword("");
    } catch (err) {
      if ((err as Error).message.includes("auth/wrong-password")) {
        setCurrentPasswordError("Senha incorreta");
      } else {
        setCurrentPasswordError("Erro ao atualizar o perfil");
      }
    } finally {
      setLoading(false); // Desativa o estado de carregamento
    }
  };

  // Verifica se algum campo foi alterado
  const isFormChanged =
    name !== initialName || phone !== initialPhone || newPassword !== "";

  return (
    <div className="container font-inter font-normal text-base w-80 md:w-96">
      <PageTitle title="Configurações" />
      <div className="text-center mb-7">
        <h2 className="text-xl font-bold">Perfil</h2>
      </div>
      {loading ? ( // Condicional para mostrar loading
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <FaSpinner className="animate-spin h-8 w-8 text-CC3333" />
        </div>
      ) : (
        <form onSubmit={handleUpdate}>
          <div className="mb-4 relative">
            <label className="block text-gray-700">Nome</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`py-2 border-b placeholder:text-D4D4D4 focus:outline-none w-80 md:w-96 ${
                nameError ? "border-red-500" : "border-black"
              }`}
              placeholder="Digite seu nome"
            />
            <FaUserLarge className="absolute inset-y-0 right-0 mt-11 mr-2 h-3 w-3" />
          </div>
          <div className="mb-4 relative">
            <label className="block text-gray-700">Email</label>
            <p className="text-gray-900 border-black border-b py-2">
              {user.email}
            </p>
            <MdEmail className="absolute inset-y-0 right-0 mt-10 mr-2 h-4 w-4" />
          </div>
          <div className="mb-4 relative">
            <label className="block text-gray-700">Telefone</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={`py-2 border-b placeholder:text-D4D4D4 focus:outline-none w-80 md:w-96 ${
                phoneError ? "border-red-500" : "border-black"
              }`}
              placeholder="Digite seu telefone"
            />
            <FaPhoneAlt className="absolute inset-y-0 right-0 mt-10 mr-2 h-3 w-3" />
          </div>
          <div className="relative mb-4">
            <label className="block text-gray-700">Senha Atual</label>
            <input
              type={showCurrentPassword ? "text" : "password"}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className={`py-2 border-b placeholder:text-D4D4D4 focus:outline-none w-80 md:w-96 ${
                currentPasswordError ? "border-red-500" : "border-black"
              }`}
              placeholder="Digite sua senha atual"
            />
            <button
              type="button"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              className="absolute inset-y-0 right-0 pr-2 mt-6"
            >
              {showCurrentPassword ? (
                <FaEyeSlash className="h-4 w-4 text-black" />
              ) : (
                <FaEye className="h-4 w-4 text-black" />
              )}
            </button>
            {currentPasswordError && (
              <p className="text-red-500 text-sm mt-1">
                {currentPasswordError}
              </p>
            )}
          </div>
          <div className="relative mb-7">
            <label className="block text-gray-700">Nova Senha</label>
            <input
              type={showNewPassword ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className={`py-2 border-b placeholder:text-D4D4D4 focus:outline-none w-80 md:w-96 ${
                newPasswordError ? "border-red-500" : "border-black"
              }`}
              placeholder="Digite sua nova senha"
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute inset-y-0 right-0 pr-2 mt-6"
            >
              {showNewPassword ? (
                <FaEyeSlash className="h-4 w-4 text-black" />
              ) : (
                <FaEye className="h-4 w-4 text-black" />
              )}
            </button>
            {newPasswordError && (
              <p className="text-red-500 text-sm mt-1">{newPasswordError}</p>
            )}
          </div>
          <button
            type="submit"
            className={`w-full bg-CC3333 text-white font-bold py-2 px-4 rounded-md ${
              loading || !isFormChanged ? "opacity-50" : ""
            }`}
            disabled={loading || !isFormChanged}
          >
            Atualizar
            {loading && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <FaSpinner className="animate-spin h-8 w-8 text-CC3333" />
              </div>
            )}
          </button>
        </form>
      )}
    </div>
  );
};

export default ProfileSettingsForm;
