import React, { useState } from "react";
import { deleteDoc, doc } from "firebase/firestore";
import { ref, deleteObject } from "firebase/storage";
import { db, storage } from "../../Services/firebaseConfig";
import { DeleteProductButtonProps } from "../../Types";
import { RiDeleteBin6Fill } from "react-icons/ri";

const DeleteProductButton: React.FC<DeleteProductButtonProps> = ({ productId, productImageUrl, onProductDeleted }) => {
  const [isModalOpen, setIsModalOpen] = useState(false); // Estado para controlar o modal

  const handleDeleteProduct = async () => {
    try {
      // Excluir produto do Firestore
      await deleteDoc(doc(db, "products", productId));

      // Decodificar a URL e extrair o nome do arquivo
      const imagePath = decodeURIComponent(productImageUrl.split("/o/")[1].split("?")[0]);

      // Excluir imagem do Firebase Storage
      const imageRef = ref(storage, imagePath);
      await deleteObject(imageRef);

      onProductDeleted(); // Atualizar a lista de produtos
    } catch (error) {
      console.error(error);
    }
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleConfirmDelete = () => {
    handleDeleteProduct();
    setIsModalOpen(false);
  };

  return (
    <>
      <button onClick={handleOpenModal} className="text-CC3333">
        <RiDeleteBin6Fill />
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white mx-10 pt-10 pb-7 px-4 rounded-lg shadow-lg w-510px text-center font-inter font-bold text-base">
          <div className="flex justify-center mb-8">
            <p className='flex justify-center items-center border-4 border-FACEA8 rounded-full h-20 w-20 text-FACEA8 font-normal text-5xl'>!</p>
          </div>
          <h3 className="text-2xl">Atenção</h3>
          <p className="font-normal text-xl my-4">Tem certeza de que deseja excluir esse produto?</p>
          <div className="mt-4 flex justify-center">
            <button
              onClick={handleCloseModal}
              className="bg-ADABAC text-white py-2 px-6 mr-16 rounded"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirmDelete}
              className="bg-CC3333 text-white py-2 px-6 rounded"
            >
              Confirmar
            </button>
          </div>
        </div>
      </div>
      )}
    </>
  );
};

export default DeleteProductButton;
