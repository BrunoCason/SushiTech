import React, { useState } from "react";

const AddTableModal: React.FC<{
  onClose: () => void;
  onSubmit: (tableNumber: string) => void;
}> = ({ onClose, onSubmit }) => {
  const [newTableNumber, setNewTableNumber] = useState<string>("");

  const handleSubmit = () => {
    if (newTableNumber) {
      onSubmit(newTableNumber);
      setNewTableNumber(""); // Limpa o campo após o submit
      onClose(); // Fecha o modal
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white py-9 rounded-lg shadow-lg relative max-w-md w-full font-inter text-base mx-5">
        <div className="flex justify-center items-center mb-8">
          <p className="font-medium mr-5 ">Insira o número da mesa</p>
          <input
            type="number"
            placeholder="Nº"
            value={newTableNumber}
            onChange={(e) => setNewTableNumber(e.target.value)}
            className="border border-ADABAC w-28 h-14 rounded-md focus:outline-none text-center font-medium"
          />
        </div>
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
