import React, { useState } from 'react';
import { deleteDoc, doc, getFirestore } from 'firebase/firestore';
import { DeleteUserConfirmationProps } from "../../Types";
import ModalConfirmation from '../ModalConfirmation';

const DeleteUserConfirmation: React.FC<DeleteUserConfirmationProps> = ({ email, onClose, onUserDeleted }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalMessage, setModalMessage] = useState<string | null>(null);
  const db = getFirestore();

  const handleDeleteUser = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:3000/api/users/delete-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const responseData = await response.json();

      if (response.ok) {
        // Obtem o UID do usuário excluído do backend
        const { uid } = responseData;
        
        // Exclui o documento do Firestore com o UID do usuário
        const userDocRef = doc(db, 'users', uid);
        await deleteDoc(userDocRef);

        setModalMessage('Usuário excluído com sucesso.');
        onUserDeleted(email);
        onClose();
      } else {
        setError(responseData.error || 'Erro ao excluir usuário.');
      }
    } catch (error) {
      setError('Erro ao excluir usuário.');
      console.error('Erro ao chamar o endpoint:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white mx-10 pt-10 pb-7 px-4 rounded-lg shadow-lg w-510px text-center font-inter font-bold text-base">
        <div className="flex justify-center mb-8">
          <p className='flex justify-center items-center border-4 border-FACEA8 rounded-full h-20 w-20 text-FACEA8 font-normal text-5xl'>!</p>
        </div>
        <h3 className="text-2xl">Atenção</h3>
        <p className="font-normal text-xl my-4">Tem certeza de que deseja excluir esse usuário?</p>
        {error && <p className="text-red-500">{error}</p>}
        <div className="mt-4 flex justify-center">
          <button
            onClick={onClose}
            className="bg-ADABAC text-white py-2 px-6 mr-16 rounded hover:bg-gray-600"
          >
            Cancelar
          </button>
          <button
            onClick={handleDeleteUser}
            className="bg-CC3333 text-white py-2 px-6 rounded hover:bg-red-600"
          >
            {loading ? 'Excluindo...' : 'Confirmar'}
          </button>
        </div>
      </div>
      {modalMessage && (
        <ModalConfirmation message={modalMessage} />
      )}
    </div>
  );
};

export default DeleteUserConfirmation;
