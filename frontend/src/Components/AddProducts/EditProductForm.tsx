import React, { useState, useEffect } from "react";
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
  "Bebida",
  "Combos",
  "Donburi",
  "Frito",
  "Katsu",
  "Maki",
  "Nigiri",
  "Sashimi",
  "Sushi",
  "Temaki",
  "Uramaki",
  "Yakimeshi",
];

const EditProductForm = ({
  productId,
  productName,
  productDescription,
  productPrice,
  productTags,
  onUpdate,
  onCancel,
}: EditProductFormProps) => {
  const [editProductName, setEditProductName] = useState<string>(productName);
  const [editProductDescription, setEditProductDescription] =
    useState<string>(productDescription);
  const [editProductPrice, setEditProductPrice] =
    useState<number>(productPrice);
  const [editProductImage, setEditProductImage] = useState<File | null>(null);
  const [editProductTag, setEditProductTag] = useState<string | null>(
    productTags[0] || null
  );
  const [showTagsMenu, setShowTagsMenu] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isModified, setIsModified] = useState(false);
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchProductImage = async () => {
      const productRef = doc(db, "products", productId);
      const productDoc = await getDoc(productRef);
      setCurrentImageUrl(productDoc.data()?.image || "");
    };

    fetchProductImage();
  }, [productId]);

  useEffect(() => {
    const hasChanges =
      editProductName !== productName ||
      editProductDescription !== productDescription ||
      editProductPrice !== productPrice ||
      (editProductTag ? [editProductTag] : []).toString() !==
        productTags.toString() ||
      editProductImage !== null;

    setIsModified(hasChanges);
  }, [
    editProductName,
    editProductDescription,
    editProductPrice,
    editProductTag,
    productName,
    productDescription,
    productPrice,
    productTags,
    editProductImage,
  ]);

  const handleEditProduct = async () => {
    if (
      isModified &&
      editProductName &&
      editProductDescription &&
      editProductPrice >= 0
    ) {
      setLoading(true);

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
          image: newImageUrl || oldImageUrl,
          tags: editProductTag ? [editProductTag] : [],
        });

        onUpdate();
      } catch (error) {
        console.error("Error updating product: ", error);
      } finally {
        setLoading(false);
      }
    } else {
      console.log("Nenhuma alteração foi feita.");
    }
  };

  const handleTagEditSelect = (tag: string) => {
    setEditProductTag(tag);
    setTagInput(tag);
    setShowTagsMenu(false);
  };

  const handleTagInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTagInput(e.target.value);
    setShowTagsMenu(e.target.value.length > 0);
  };

  const filteredTags = tagsOptions.filter((tag) =>
    tag.toLowerCase().includes(tagInput.toLowerCase())
  );

  const mascaraMoeda = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.replace(/\D/g, "");
    const onlyDigits = value.padStart(3, "0");
    const digitsFloat = onlyDigits.slice(0, -2) + "." + onlyDigits.slice(-2);
    setEditProductPrice(parseFloat(digitsFloat) * 100);
  };

  const formatCurrency = (value: number) => {
    const valorString = (value / 100).toFixed(2);
    return valorString.replace(".", ",");
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    setEditProductImage(file);

    if (file) {
      const imageUrl = URL.createObjectURL(file); // Gerar a URL temporária da imagem
      setPreviewImageUrl(imageUrl); // Atualizar o estado de visualização
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <div className="flex">
          <div className="mr-4 md:mr-10">
            <input
              id="fileInput"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
            <label
              htmlFor="fileInput"
              className="relative flex flex-col justify-center items-center w-24 sm:w-48 h-96 bg-gray-300 rounded-md cursor-pointer"
            >
              {previewImageUrl ? ( // Se houver uma nova imagem selecionada, mostra a visualização
                <img
                  src={previewImageUrl}
                  alt="Nova Imagem do Produto"
                  className="w-full h-full object-cover rounded-md opacity-50 hover:opacity-100 transition-opacity duration-300"
                />
              ) : currentImageUrl ? ( // Caso contrário, mostra a imagem existente
                <img
                  src={currentImageUrl}
                  alt="Produto"
                  className="w-full h-full object-cover rounded-md opacity-50 hover:opacity-100 transition-opacity duration-300"
                />
              ) : (
                <IoMdImage className="w-20 sm:w-32 h-60 text-gray-600" />
              )}
            </label>
          </div>
          <div className="sm:w-72 flex flex-col justify-center">
            <p className="font-medium text-xl mb-3">Editar Produto</p>
            <p className="font-medium text-lg">Nome</p>
            <input
              type="text"
              placeholder="Nome do produto"
              value={editProductName}
              onChange={(e) => setEditProductName(e.target.value)}
              className="border-b border-black focus:outline-none text-BCBCBC text-base font-normal sm:w-full"
            />
            <p className="font-medium text-lg mt-3">Descrição</p>
            <input
              type="text"
              placeholder="Descrição do produto"
              value={editProductDescription}
              onChange={(e) => setEditProductDescription(e.target.value)}
              className="border-b border-black focus:outline-none text-BCBCBC text-base font-normal sm:w-full"
            />
            <p className="font-medium text-lg mt-3">Preço</p>
            <input
              type="text"
              placeholder="R$"
              value={formatCurrency(editProductPrice)}
              onChange={mascaraMoeda}
              className="border-b border-black focus:outline-none text-BCBCBC text-base font-normal sm:w-full"
            />
            <div className="flex justify-between mt-3">
              <div className="mb-4">
                <p className="font-medium text-lg">Categoria</p>
                <input
                  type="text"
                  placeholder="Insira a categoria"
                  value={tagInput}
                  onChange={handleTagInputChange}
                  className="border-b border-black focus:outline-none text-BCBCBC text-base font-normal sm:w-72"
                />
                {showTagsMenu && tagInput && (
                  <div className="absolute z-10 bg-white border border-gray-300 rounded-lg shadow-lg mt-1 w-48">
                    {filteredTags.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => handleTagEditSelect(tag)}
                        className={`block px-4 py-2 text-left hover:bg-gray-200 w-full ${
                          editProductTag === tag ? "bg-gray-100" : ""
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
                className={`${
                  isModified ? "bg-CC3333" : "bg-CC3333 bg-opacity-50"
                } rounded-md text-white font-bold w-24 h-9 flex items-center justify-center`}
                disabled={!isModified || loading}
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
