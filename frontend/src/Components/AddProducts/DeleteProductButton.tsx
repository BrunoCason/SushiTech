import React from "react";
import { deleteDoc, doc } from "firebase/firestore";
import { ref, deleteObject } from "firebase/storage";
import { db, storage } from "../../Services/firebaseConfig";
import { DeleteProductButtonProps } from "../../Types";

const DeleteProductButton: React.FC<DeleteProductButtonProps> = ({ productId, productImageUrl, onProductDeleted }) => {
  const handleDeleteProduct = async () => {
    try {
      // Excluir produto do Firestore
      await deleteDoc(doc(db, "products", productId));

      // Decodificar a URL e extrair o nome do arquivo
      const imagePath = decodeURIComponent(productImageUrl.split('/o/')[1].split('?')[0]);

      // Excluir imagem do Firebase Storage
      const imageRef = ref(storage, imagePath);
      await deleteObject(imageRef);

      console.log("Product and image deleted successfully!");
      onProductDeleted(); // Atualizar a lista de produtos
    } catch (error) {
      console.error("Error deleting product: ", error);
    }
  };

  return (
    <button
      onClick={handleDeleteProduct}
      className="text-red-500 hover:underline"
    >
      Deletar
    </button>
  );
};

export default DeleteProductButton;
