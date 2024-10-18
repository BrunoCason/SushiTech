import React, { useState } from "react";
import { getDocs, collection } from "firebase/firestore";
import { db } from "../../Services/firebaseConfig"; // Certifique-se de que a importação esteja correta

const AddTableModal: React.FC<{
  onClose: () => void;
  onSubmit: (tableNumber: string) => void;
}> = ({ onClose, onSubmit }) => {
  const [newTableNumber, setNewTableNumber] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (newTableNumber) {
      // Verifica se a mesa já existe
      const existingTables = await getDocs(collection(db, "tables"));
      const tableExists = existingTables.docs.some(
        (doc) => doc.data().number === newTableNumber
      );

      if (tableExists) {
        setErrorMessage(`A mesa número ${newTableNumber} já existe!`);
        return; // Para a execução se a mesa já existir
      } else {
        setErrorMessage(null);
        onSubmit(newTableNumber);
        setNewTableNumber("");
        onClose();
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white py-9 rounded-lg shadow-lg relative max-w-md w-full font-inter text-base mx-5">
        <div className="flex justify-center items-center">
          <p className="font-medium mr-5">Insira o número da mesa</p>
          <input
            type="number"
            placeholder="Nº"
            value={newTableNumber}
            onChange={(e) => setNewTableNumber(e.target.value)}
            className={`border ${
              errorMessage ? "border-red-500" : "border-ADABAC mb-8"
            } w-28 h-14 rounded-md focus:outline-none text-center font-medium`}
          />
        </div>
        {errorMessage && (
          <p className="text-red-500 text-center mb-8">{errorMessage}</p>
        )}
        <div className="flex justify-center items-center">
          <button
            onClick={onClose}
            className="font-bold text-white rounded w-24 h-9 bg-ADABAC mr-9"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            className="font-bold text-white rounded w-24 h-9 bg-CC3333"
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddTableModal;
