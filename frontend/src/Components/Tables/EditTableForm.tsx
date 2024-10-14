import React, { useState } from 'react';
import { updateDoc, doc, getFirestore } from 'firebase/firestore';
import { EditTableFormProps } from "../../Types";

const EditTableForm: React.FC<EditTableFormProps> = ({ tableId, currentNumber, onClose, onTableUpdated }) => {
  const [newNumber, setNewNumber] = useState<string>(currentNumber);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const db = getFirestore();

  const handleUpdateTable = async () => {
    setLoading(true);
    setError(null);

    try {
      const tableRef = doc(db, "tables", tableId);
      await updateDoc(tableRef, {
        number: newNumber,
      });

      alert('Mesa atualizada com sucesso.');
      onTableUpdated();
      onClose();
    } catch (error) {
      setError('Erro ao atualizar a mesa.');
      console.error('Erro ao atualizar a mesa:', error);
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
        <h3 className="text-lg font-semibold mb-2">Editar Mesa</h3>
        <input
          type="text"
          placeholder="Número da Mesa"
          value={newNumber}
          onChange={(e) => setNewNumber(e.target.value)}
          className="border border-gray-300 p-2 rounded-md w-full mb-4"
        />
        {error && <p className="text-red-500">{error}</p>}
        <div className="mt-4 flex justify-end">
          <button
            onClick={onClose}
            className="bg-gray-500 text-white py-1 px-4 rounded mr-2 hover:bg-gray-600"
          >
            Cancelar
          </button>
          <button
            onClick={handleUpdateTable}
            className="bg-green-500 text-white py-1 px-4 rounded hover:bg-green-600"
          >
            {loading ? 'Atualizando...' : 'Atualizar'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditTableForm;
