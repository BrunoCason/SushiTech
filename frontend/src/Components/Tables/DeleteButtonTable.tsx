import React, { useState } from 'react';
import { deleteDoc, doc, getFirestore } from 'firebase/firestore';
import { DeleteButtonTableProps } from "../../Types";

const DeleteButtonTable: React.FC<DeleteButtonTableProps> = ({ tableId, email, onTableDeleted }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
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
        // Obtém o UID do usuário excluído do backend
        const { uid } = responseData;
        
        // Exclui o documento do Firestore com o UID do usuário
        const userDocRef = doc(db, 'users', uid);
        await deleteDoc(userDocRef);

        // Exclui o documento da mesa no Firestore
        await deleteDoc(doc(db, "tables", tableId));

        alert('Mesa e usuário excluídos com sucesso.');
        onTableDeleted();
        setShowConfirm(false);
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
    <div>
      {showConfirm && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg relative max-w-md w-full">
            <button
              onClick={() => setShowConfirm(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            >
              &times;
            </button>
            <h3 className="text-lg font-semibold mb-2">Confirmação de Exclusão</h3>
            <p>Tem certeza que deseja excluir a mesa e o usuário <strong>{email}</strong>?</p>
            {error && <p className="text-red-500">{error}</p>}
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setShowConfirm(false)}
                className="bg-gray-500 text-white py-1 px-4 rounded mr-2 hover:bg-gray-600"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteUser}
                className="bg-red-500 text-white py-1 px-4 rounded hover:bg-red-600"
              >
                {loading ? 'Excluindo...' : 'Excluir'}
              </button>
            </div>
          </div>
        </div>
      )}
      <button
        onClick={() => setShowConfirm(true)}
        className="text-red-500 hover:underline"
      >
        Deletar
      </button>
    </div>
  );
};

export default DeleteButtonTable;
