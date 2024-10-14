import React, { useState } from 'react';
import { ChangePasswordFormProps } from "../../Types";

const ChangePasswordForm: React.FC<ChangePasswordFormProps> = ({ email, onClose }) => {
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        alert('Senha alterada com sucesso.');
        onClose(); // Fechar o overlay após sucesso
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
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg relative max-w-md w-full">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
        >
          &times;
        </button>
        <h3 className="text-lg font-semibold mb-2">Alterar Senha para {email}</h3>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <div className="mb-4">
          <label className="block text-gray-700">Nova Senha:</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="Digite a nova senha"
            required
          />
        </div>
        <button
          onClick={handleChangePassword}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
        >
          Alterar Senha
        </button>
        {loading && <p className="mt-4 text-blue-500">Alterando a senha...</p>}
      </div>
    </div>
  );
};

export default ChangePasswordForm;
