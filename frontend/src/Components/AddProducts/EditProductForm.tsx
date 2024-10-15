import React, { useState } from "react";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { db, storage } from "../../Services/firebaseConfig";
import { EditProductFormProps } from "../../Types";

const tagsOptions = ["Temaki", "Frito", "Bebida", "Sashimi", "Nigiri", "Sushi", "Maki", "Donburi", "Uramaki", "Yakimeshi", "Katsu"];

const EditProductForm: React.FC<EditProductFormProps> = ({ productId, productName, productDescription, productPrice, productQuantity, productTags, onUpdate, onCancel }) => {
  const [editProductName, setEditProductName] = useState<string>(productName);
  const [editProductDescription, setEditProductDescription] = useState<string>(productDescription);
  const [editProductPrice, setEditProductPrice] = useState<number>(productPrice);
  const [editProductQuantity, setEditProductQuantity] = useState<number>(productQuantity);
  const [editProductImage, setEditProductImage] = useState<File | null>(null);
  const [editProductTags, setEditProductTags] = useState<string[]>(productTags);
  const [showTagsMenu, setShowTagsMenu] = useState(false);

  const handleEditProduct = async () => {
    if (editProductName && editProductDescription && editProductPrice > 0 && editProductQuantity > 0) {
      try {
        let newImageUrl = "";

        const productRef = doc(db, "products", productId);
        const productDoc = await getDoc(productRef);
        const oldImageUrl = productDoc.data()?.image || "";

        if (editProductImage) {
          const imageRef = ref(storage, `products/${editProductImage.name}`);
          const snapshot = await uploadBytes(imageRef, editProductImage);
          newImageUrl = await getDownloadURL(snapshot.ref);

          if (oldImageUrl) {
            const oldImagePath = decodeURIComponent(oldImageUrl.split('/o/')[1].split('?')[0]);
            const oldImageRef = ref(storage, oldImagePath);
            await deleteObject(oldImageRef);
          }
        }

        await updateDoc(productRef, {
          name: editProductName,
          description: editProductDescription,
          price: editProductPrice,
          quantity: editProductQuantity,
          image: newImageUrl || oldImageUrl,
          tags: editProductTags,
        });

        onUpdate();
      } catch (error) {
        console.error("Error updating product: ", error);
      }
    } else {
      console.log("Please enter product name, price, and quantity.");
    }
  };

  const handleTagEditSelect = (tag: string) => {
    setEditProductTags(prevTags =>
      prevTags.includes(tag) ? prevTags.filter(t => t !== tag) : [...prevTags, tag]
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white">
      <h2 className="text-2xl font-semibold mb-4">Editar Produto</h2>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Nome"
          value={editProductName}
          onChange={(e) => setEditProductName(e.target.value)}
          className="border border-gray-300 p-2 rounded-md mr-2"
        />
        <input
          type="text"
          placeholder="Descrição"
          value={editProductDescription}
          onChange={(e) => setEditProductDescription(e.target.value)}
          className="border border-gray-300 p-2 rounded-md mr-2"
        />
        <input
          type="number"
          placeholder="Preço"
          value={editProductPrice}
          onChange={(e) => setEditProductPrice(Number(e.target.value))}
          className="border border-gray-300 p-2 rounded-md mr-2"
        />
        <input
          type="number"
          placeholder="Quantidade"
          value={editProductQuantity}
          onChange={(e) => setEditProductQuantity(Number(e.target.value))}
          className="border border-gray-300 p-2 rounded-md mr-2"
        />
        <input
          type="file"
          onChange={(e) => setEditProductImage(e.target.files ? e.target.files[0] : null)}
          className="border border-gray-300 p-2 rounded-md mr-2"
        />
        <div className="relative">
          <button
            onClick={() => setShowTagsMenu(!showTagsMenu)}
            className="border border-gray-300 p-2 rounded-md mr-2"
          >
            {editProductTags.length ? editProductTags.join(", ") : "Selecionar Tags"}
          </button>
          {showTagsMenu && (
            <div className="absolute z-10 bg-white border border-gray-300 rounded-lg shadow-lg mt-1 w-48">
              {tagsOptions.map(tag => (
                <button
                  key={tag}
                  onClick={() => handleTagEditSelect(tag)}
                  className={`block px-4 py-2 text-left hover:bg-gray-200 w-full ${editProductTags.includes(tag) ? 'bg-gray-100' : ''}`}
                >
                  {tag}
                </button>
              ))}
            </div>
          )}
        </div>
        <button
          onClick={handleEditProduct}
          className="bg-blue-500 text-white px-4 py-2 rounded-md"
        >
          Atualizar
        </button>
        <button
          onClick={onCancel}
          className="bg-gray-500 text-white px-4 py-2 rounded-md ml-2"
        >
          Cancelar
        </button>
      </div>
      </div>
    </div>
  );
};

export default EditProductForm;
