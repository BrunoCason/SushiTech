import React, { useState } from "react";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { db, storage } from "../../Services/firebaseConfig";
import { EditProductFormProps } from "../../Types";
import { IoMdImage } from "react-icons/io";

const tagsOptions = [
  "Temaki",
  "Frito",
  "Bebida",
  "Sashimi",
  "Nigiri",
  "Sushi",
  "Maki",
  "Donburi",
  "Uramaki",
  "Yakimeshi",
  "Katsu",
];

const EditProductForm: React.FC<EditProductFormProps> = ({
  productId,
  productName,
  productDescription,
  productPrice,
  productQuantity,
  productTags,
  onUpdate,
  onCancel,
}) => {
  const [editProductName, setEditProductName] = useState<string>(productName);
  const [editProductDescription, setEditProductDescription] =
    useState<string>(productDescription);
  const [editProductPrice, setEditProductPrice] =
    useState<number>(productPrice);
  const [editProductQuantity, setEditProductQuantity] =
    useState<number>(productQuantity);
  const [editProductImage, setEditProductImage] = useState<File | null>(null);
  const [editProductTags, setEditProductTags] = useState<string[]>(productTags);
  const [showTagsMenu, setShowTagsMenu] = useState(false);

  const handleEditProduct = async () => {
    if (
      editProductName &&
      editProductDescription &&
      editProductPrice > 0 &&
      editProductQuantity > 0
    ) {
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
            const oldImagePath = decodeURIComponent(
              oldImageUrl.split("/o/")[1].split("?")[0]
            );
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
    setEditProductTags((prevTags) =>
      prevTags.includes(tag)
        ? prevTags.filter((t) => t !== tag)
        : [...prevTags, tag]
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <div className="flex">
          <div className="mr-5">
            <input
              id="fileInput"
              type="file"
              accept="image/*"
              onChange={(e) =>
                setEditProductImage(e.target.files ? e.target.files[0] : null)
              }
              className="hidden "
            />
            <label
              htmlFor="fileInput"
              className="flex flex-col justify-center items-center w-64 h-96 bg-gray-300 rounded-md cursor-pointer"
            >
              <IoMdImage className="w-60 h-60 text-gray-600" />
            </label>
          </div>
          <div className="w-72">
            <p className="font-medium text-xl mb-3">Editar Produto</p>
            <p className="font-medium text-lg">Nome</p>
            <input
              type="text"
              placeholder="Nome do produto"
              value={editProductName}
              onChange={(e) => setEditProductName(e.target.value)}
              className="border-b border-black focus:outline-none text-BCBCBC text-base font-normal w-full"
            />
            <p className="font-medium text-lg mt-3">Descrição</p>
            <input
              type="text"
              placeholder="Descrição do produto"
              value={editProductDescription}
              onChange={(e) => setEditProductDescription(e.target.value)}
              className="border-b border-black focus:outline-none text-BCBCBC text-base font-normal w-full"
            />
            <p className="font-medium text-lg mt-3">Preço</p>
            <input
              type="number"
              placeholder="R$"
              value={editProductPrice}
              onChange={(e) => setEditProductPrice(Number(e.target.value))}
              className="border-b border-black focus:outline-none text-BCBCBC text-base font-normal w-full"
            />
            <div className="flex justify-between mt-3">
              <div>
                <p className="font-medium text-lg mb-5">Peças/Unidades</p>
                <input
                  type="number"
                  placeholder="Quantidade"
                  value={editProductQuantity}
                  onChange={(e) =>
                    setEditProductQuantity(Number(e.target.value))
                  }
                  className="border border-black focus:outline-none rounded-md text-center w-24 h-9"
                />
              </div>
              <div className="mb-4">
                <p className="font-medium text-lg mb-5">Categoria</p>
                <button
                  onClick={() => setShowTagsMenu(!showTagsMenu)}
                  className="border border-black rounded-md w-24 h-9"
                >
                  {productTags.length ? productTags.join(", ") : "Selecione"}
                </button>
                {showTagsMenu && (
                  <div className="absolute z-10 bg-white border border-gray-300 rounded-lg shadow-lg mt-1 w-48">
                    {tagsOptions.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => handleTagEditSelect(tag)}
                        className={`block px-4 py-2 text-left hover:bg-gray-200 w-full ${
                          productTags.includes(tag) ? "bg-gray-100" : ""
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="flex justify-between mt-3">
              <button
                onClick={onCancel}
                className="bg-ADABAC rounded-md text-white font-bold w-24 h-9"
              >
                Cancelar
              </button>

              <button
                onClick={handleEditProduct}
                className="bg-CC3333 rounded-md text-white font-bold w-24 h-9"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProductForm;
