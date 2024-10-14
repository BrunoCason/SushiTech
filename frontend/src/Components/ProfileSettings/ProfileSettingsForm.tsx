import { useState, useEffect } from 'react';
import { User, reauthenticateWithCredential, updatePassword, EmailAuthProvider } from 'firebase/auth';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import PageTitle from '../PageTitle';
import { fetchUserProfile, updateUserProfile } from '../../Services/userService';
import ModalConfirmation from '../ModalConfirmation';

interface ProfileSettingsFormProps {
  user: User; // Recebe o usuário como prop
}

const ProfileSettingsForm = ({ user }: ProfileSettingsFormProps) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [currentPasswordError, setCurrentPasswordError] = useState<string | null>(null);
  const [newPasswordError, setNewPasswordError] = useState<string | null>(null);
  const [name, setName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [modalMessage, setModalMessage] = useState<string>('');
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchUserProfileData = async () => {
      try {
        const profileData = await fetchUserProfile(user.uid);
        setName(profileData.name || '');
        setPhone(profileData.phone || '');
      } catch (error) {
        console.error("Erro ao buscar dados do perfil:", error);
      }
    };

    fetchUserProfileData();
  }, [user.uid]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPasswordError(null);
    setNewPasswordError(null);

    if (newPassword && newPassword === currentPassword) {
      setNewPasswordError('A nova senha não pode ser a mesma que a atual');
      return;
    }

    try {
      // Atualiza dados de perfil
      await updateUserProfile(user.uid, { name, phone });

      // Se a nova senha for fornecida, atualiza a senha
      if (newPassword) {
        if (!user.email) {
          throw new Error('Email do usuário não disponível');
        }

        const credential = EmailAuthProvider.credential(user.email, currentPassword);
        await reauthenticateWithCredential(user, credential);
        await updatePassword(user, newPassword);
      }

      // Exibe o modal de sucesso
      setModalMessage('Perfil atualizado com sucesso!');
      setShowModal(true);

      // Limpa os campos
      setCurrentPassword('');
      setNewPassword('');
      
      // Fecha o modal após 3 segundos
      setTimeout(() => setShowModal(false), 3000);
    } catch (err) {
      if ((err as Error).message.includes('auth/wrong-password')) {
        setCurrentPasswordError('Senha incorreta');
      } else {
        setCurrentPasswordError('Senha incorreta');
      }
    }
  };

  return (
    <div className="container font-inter font-normal text-base w-80 md:w-96">
      <PageTitle title="Configurações" />
      <div className="text-center mb-7">
        <h2 className="text-xl font-bold">Perfil</h2>
      </div>
      <form onSubmit={handleUpdate}>
        <div className="mb-4">
          <label className="block text-gray-700">Nome</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="py-2 border-b border-black placeholder:text-D4D4D4 focus:outline-none w-80 md:w-96"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Email</label>
          <p className="text-gray-900 border-black border-b pb-1">{user.email}</p>
      </div>
        <div className="mb-4">
          <label className="block text-gray-700">Telefone</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="py-2 border-b border-black placeholder:text-D4D4D4 focus:outline-none w-80 md:w-96"
          />
        </div>
        <div className="relative mb-4">
          <label className="block text-gray-700">Senha Atual</label>
          <input
            type={showCurrentPassword ? 'text' : 'password'}
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className={`py-2 border-b placeholder:text-D4D4D4 focus:outline-none w-80 md:w-96 ${currentPasswordError ? 'border-red-500' : 'border-black'}`}
            placeholder="Digite sua senha atual"
          />
          <button
            type="button"
            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
            className="absolute inset-y-0 right-0 pr-3 mt-6"
          >
            {showCurrentPassword ? (
              <FaEyeSlash className="h-4 w-4 text-black" />
            ) : (
              <FaEye className="h-4 w-4 text-black" />
            )}
          </button>
          {currentPasswordError && (
            <p className="text-red-500 text-sm mt-1">{currentPasswordError}</p>
          )}
        </div>
        <div className="relative mb-7">
          <label className="block text-gray-700">Nova Senha</label>
          <input
            type={showNewPassword ? 'text' : 'password'}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className={`py-2 border-b placeholder:text-D4D4D4 focus:outline-none w-80 md:w-96 ${newPasswordError ? 'border-red-500' : 'border-black'}`}
            placeholder="Digite sua nova senha"
          />
          <button
            type="button"
            onClick={() => setShowNewPassword(!showNewPassword)}
            className="absolute inset-y-0 right-0 pr-3 mt-6"
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
          className="w-full bg-CC3333 text-white font-bold py-2 px-4 rounded-md"
        >
          Atualizar
        </button>
      </form>

      {/* Renderiza o modal se showModal for true */}
      {showModal && <ModalConfirmation message={modalMessage} />}
    </div>
  );
};

export default ProfileSettingsForm;
