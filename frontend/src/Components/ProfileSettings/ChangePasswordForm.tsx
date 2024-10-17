import React, { useState } from 'react';
import { ChangePasswordFormProps } from "../../Types";
import { FaEye, FaEyeSlash, FaSpinner } from 'react-icons/fa'; // Importando FaSpinner para usar como ícone de loading

const ChangePasswordForm: React.FC<ChangePasswordFormProps> = ({ email, onClose }) => {
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

  const handleChangePassword = async () => {
    if (!newPassword) {
      setError('Nova senha é necessária.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:3000/api/users/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, newPassword }),
      });

      if (response.ok) {
        onClose();
      } else {
        const errorMessage = await response.text();
        setError(errorMessage);
      }
    } catch (error) {
      setError('Erro ao alterar a senha.');
      console.error('Erro ao chamar o endpoint:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40">
        <div className="bg-white py-8 px-16 rounded-lg shadow-lg font-inter font-bold text-base">
          <p className="font-normal mb-6">Alterar Senha de <span className='font-bold'>{email}</span></p>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <div className="mb-8 relative">
            <input
              type={confirmPasswordVisible ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="border-b placeholder:text-D4D4D4 w-full font-normal focus:outline-none"
              placeholder="Digite a nova senha"
            />
            <button
              type="button"
              onClick={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
              className="absolute mt-1 right-0 px-2 cursor-pointer"
            >
              {confirmPasswordVisible ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
          <div className='flex justify-center'>
            <button
              onClick={onClose}
              className="bg-ADABAC text-white py-2 px-6 rounded-md mr-9"
            >
              Cancelar
            </button>
            <button
              onClick={handleChangePassword}
              className="bg-CC3333 text-white py-2 px-4 rounded-md"
            >
              Confirmar
            </button>
          </div>
          {loading && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <FaSpinner className="animate-spin text-CC3333 h-8 w-8" />
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ChangePasswordForm;
