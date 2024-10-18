import React, { useState } from "react";
import { getDocs, collection } from "firebase/firestore";
import { db } from "../../Services/firebaseConfig";
import { FaSpinner } from "react-icons/fa";

const AddTableModal: React.FC<{
  onClose: () => void;
  onSubmit: (tableNumber: string) => void;
}> = ({ onClose, onSubmit }) => {
  const [newTableNumber, setNewTableNumber] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async () => {
    if (newTableNumber) {
      setLoading(true);
      try {
        // Verifica se a mesa já existe
        const existingTables = await getDocs(collection(db, "tables"));
        const tableExists = existingTables.docs.some(
          (doc) => doc.data().number === newTableNumber
        );

        if (tableExists) {
          setErrorMessage(`A mesa número ${newTableNumber} já existe!`);
          setLoading(false);
          return; // Para a execução se a mesa já existir
        } else {
          setErrorMessage(null);
          onSubmit(newTableNumber);
          setNewTableNumber("");
          onClose();
        }
      } catch (error) {
        console.error("Erro ao adicionar mesa:", error);
        setLoading(false);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white py-9 rounded-lg shadow-lg relative max-w-md w-full font-inter text-base mx-5">
        <div className="flex justify-center items-center mb-8">
          <p className="font-medium ml-5 sm:ml-0 mr-5">
            Insira o número da mesa
          </p>
          <input
            type="number"
            placeholder="Nº"
            value={newTableNumber}
            onChange={(e) => setNewTableNumber(e.target.value)}
            className={`border ${
              errorMessage ? "border-red-500" : "border-ADABAC"
            } w-28 h-14 rounded-md focus:outline-none text-center font-medium mr-5 sm:m5-0`}
            disabled={loading}
          />
        </div>
        {errorMessage && (
          <p className="text-red-500 text-center mb-8">{errorMessage}</p>
        )}
        <div className="flex justify-center items-center">
          <button
            onClick={onClose}
            className="font-bold text-white rounded w-24 h-9 bg-ADABAC mr-9"
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            className="font-bold text-white rounded w-24 h-9 bg-CC3333 flex justify-center items-center"
            disabled={loading}
          >
            Confirmar
            {loading && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <FaSpinner className="animate-spin text-CC3333 h-8 w-8" />
              </div>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddTableModal;
