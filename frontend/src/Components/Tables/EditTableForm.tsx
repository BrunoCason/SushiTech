import React, { useState } from "react";
import { updateDoc, doc, getFirestore } from "firebase/firestore";
import { EditTableFormProps } from "../../Types";
import { FaSpinner } from "react-icons/fa";
import ModalConfirmation from "../ModalConfirmation"; // Import do Modal

const EditTableForm: React.FC<EditTableFormProps> = ({
  tableId,
  currentNumber,
  onClose,
  onTableUpdated,
}) => {
  const [newNumber, setNewNumber] = useState<string>(currentNumber);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState<boolean>(false); // Estado para o modal de confirmação
  const [showEditModal, setShowEditModal] = useState<boolean>(true); // Estado para controlar a exibição do modal de edição
  const db = getFirestore();

  const handleUpdateTable = async () => {
    setLoading(true);
    setError(null);

    try {
      const tableRef = doc(db, "tables", tableId);
      await updateDoc(tableRef, {
        number: newNumber,
      });

      onTableUpdated();

      // Exibe o loading por um breve momento antes de fechar o modal de edição
      setTimeout(() => {
        setShowEditModal(false); // Fecha o modal de edição
        setShowConfirmation(true); // Exibe o modal de confirmação
        setTimeout(() => {
          setShowConfirmation(false); // Oculta o modal de confirmação após alguns segundos
          onClose(); // Fecha o modal de edição (opcional)
        }, 3000);
      }, 1000); // 1 segundo de loading
    } catch (error) {
      setError("Erro ao atualizar a mesa.");
      console.error("Erro ao atualizar a mesa:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white py-9 rounded-lg shadow-lg relative max-w-md w-full font-inter text-base mx-5">
            <div className="flex justify-center items-center mb-8">
              <p className="font-medium ml-5 sm:ml-0 mr-5">
                Insira o novo número da mesa
              </p>
              <input
                type="number"
                placeholder="Nº"
                value={newNumber}
                onChange={(e) => setNewNumber(e.target.value)}
                className="border border-ADABAC w-28 h-14 rounded-md focus:outline-none text-center font-medium mr-5 sm:m5-0"
              />
              {error && <p className="text-red-500">{error}</p>}
            </div>
            <div className="flex justify-center items-center">
              <button
                onClick={onClose}
                className="font-bold text-white rounded w-24 h-9 bg-ADABAC mr-9"
              >
                Cancelar
              </button>
              <button
                onClick={handleUpdateTable}
                className="font-bold text-white rounded w-24 h-9 bg-CC3333"
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
      )}

      {/* Modal de Confirmação */}
      {showConfirmation && (
        <ModalConfirmation message="Mesa atualizada com sucesso!" />
      )}
    </>
  );
};

export default EditTableForm;
