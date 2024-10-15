import React, { useState, useEffect } from "react";
import { collection, addDoc, getDocs } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../../Services/firebaseConfig";
import PageTitle from "../PageTitle";
import DeleteProductButton from "./DeleteProductButton";
import EditProductForm from "./EditProductForm";
import { MdEdit } from "react-icons/md";
import { IoMdAdd } from "react-icons/io";
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

const AddProducts: React.FC = () => {
  const [productName, setProductName] = useState<string>("");
  const [productPrice, setProductPrice] = useState<number>(0);
  const [productDescription, setProductDescription] = useState<string>("");
  const [productQuantity, setProductQuantity] = useState<number>(0);
  const [productImage, setProductImage] = useState<File | null>(null);
  const [productTags, setProductTags] = useState<string[]>([]);
  const [products, setProducts] = useState<
    {
      id: string;
      name: string;
      description: string;
      price: number;
      quantity: number;
      image: string;
      tags: string[];
    }[]
  >([]);
  const [editProductId, setEditProductId] = useState<string | null>(null);
  const [editProductName, setEditProductName] = useState<string>("");
  const [editProductDescription, setEditProductDescription] = useState<string>("");
  const [editProductPrice, setEditProductPrice] = useState<number>(0);
  const [editProductQuantity, setEditProductQuantity] = useState<number>(0);
  const [editProductTags, setEditProductTags] = useState<string[]>([]);
  const [showTagsMenu, setShowTagsMenu] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddProduct = async () => {
    if (
      productName &&
      productDescription &&
      productPrice > 0 &&
      productQuantity > 0 &&
      productImage
    ) {
      try {
        const imageRef = ref(storage, `products/${productImage.name}`);
        const snapshot = await uploadBytes(imageRef, productImage);
        const imageUrl = await getDownloadURL(snapshot.ref);

        await addDoc(collection(db, "products"), {
          name: productName,
          description: productDescription,
          price: productPrice,
          quantity: productQuantity,
          image: imageUrl,
          tags: productTags,
        });
        console.log("Product added successfully!");
        setProductName("");
        setProductDescription("");
        setProductPrice(0);
        setProductQuantity(0);
        setProductImage(null);
        setProductTags([]);
        fetchProducts();
        setIsModalOpen(false); // Fecha o modal após adicionar o produto
      } catch (error) {
        console.error("Error adding product: ", error);
      }
    } else {
      console.log(
        "Please enter product name, price, quantity, and upload an image."
      );
    }
  };

  const fetchProducts = async () => {
    const querySnapshot = await getDocs(collection(db, "products"));
    const productsList = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as {
      id: string;
      name: string;
      description: string;
      price: number;
      quantity: number;
      image: string;
      tags: string[];
    }[];
    setProducts(productsList);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleTagSelect = (tag: string) => {
    setProductTags((prevTags) =>
      prevTags.includes(tag)
        ? prevTags.filter((t) => t !== tag)
        : [...prevTags, tag]
    );
  };

  return (
    <div className="container mx-auto mt-32 font-inter">
      <PageTitle title="Produtos" />

      <button
        className="flex justify-center items-center text-sm w-40 mb-7 sm:mb-0 p-2 font-bold text-CC3333 border border-CC3333 rounded-md"
        onClick={() => setIsModalOpen(true)}
      >
        <IoMdAdd className="h-4 w-4" />
        Adicionar Produto
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex">
              <div className="mr-10">
                <input
                  id="fileInput"
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setProductImage(e.target.files ? e.target.files[0] : null)
                  }
                  className="hidden "
                />
                <label
                  htmlFor="fileInput"
                  className="flex flex-col justify-center items-center w-72 h-96 bg-gray-300 rounded-md cursor-pointer"
                >
                  <IoMdImage className="w-60 h-60 text-gray-600" />
                </label>
              </div>
              <div>
                <p className="font-medium text-xl mb-3">Adicionar Produto</p>
                <p className="font-medium text-lg">Nome</p>
                <input
                  type="text"
                  placeholder="Nome do produto"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className="border-b border-black focus:outline-none text-BCBCBC text-base font-normal w-full"
                />
                <p className="font-medium text-lg mt-3">Descrição</p>
                <input
                  type="text"
                  placeholder="Descrição do produto"
                  value={productDescription}
                  onChange={(e) => setProductDescription(e.target.value)}
                  className="border-b border-black focus:outline-none text-BCBCBC text-base font-normal w-full"
                />
                <p className="font-medium text-lg mt-3">Preço</p>
                <input
                  type="number"
                  placeholder="R$"
                  value={productPrice}
                  onChange={(e) => setProductPrice(Number(e.target.value))}
                  className="border-b border-black focus:outline-none text-BCBCBC text-base font-normal w-full"
                />
                <div className="flex mt-3">
                  <div>
                    <p className="font-medium text-lg mb-5">Peças/Unidades</p>
                    <input
                      type="number"
                      placeholder="Quantidade"
                      value={productQuantity}
                      onChange={(e) =>
                        setProductQuantity(Number(e.target.value))
                      }
                      className="border border-black focus:outline-none rounded-md text-center w-24 h-9"
                    />
                  </div>
                  <div className="relative mb-4">
                    <p className="font-medium text-lg mb-5">Categoria</p>
                    <button
                      onClick={() => setShowTagsMenu(!showTagsMenu)}
                      className="border border-black rounded-md w-24 h-9"
                    >
                      {productTags.length
                        ? productTags.join(", ")
                        : "Selecione"}
                    </button>
                    {showTagsMenu && (
                      <div className="absolute z-10 bg-white border border-gray-300 rounded-lg shadow-lg mt-1 w-48">
                        {tagsOptions.map((tag) => (
                          <button
                            key={tag}
                            onClick={() => handleTagSelect(tag)}
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
                    onClick={() => setIsModalOpen(false)}
                    className="bg-ADABAC rounded-md text-white font-bold w-24 h-9"
                  >
                    Cancelar
                  </button>

                  <button
                    onClick={handleAddProduct}
                    className="bg-CC3333 rounded-md text-white font-bold w-24 h-9"
                  >
                    Salvar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-center">
      <div className="font-inter grid grid-cols-2 2xl:grid-cols-3 gap-6">
        {products.map((product) => (
          <div
            key={product.id}
            className="flex justify-between border w-432px h-156px border-A7A7A7 rounded-md shadow-md p-3"
          >
            <div className="w-56">
              <p className="font-bold text-lg mb-2">
                {product.name} - {product.quantity} uni
              </p>
              <p className="font-medium text-sm text-E6E6E h-16 text-justify">{product.description}</p>
              <div className="flex justify-between">
                <p className="font-bold text-sm">R$ {product.price}</p>
                <div className="space-x-4">
                  <button
                    onClick={() => {
                      setEditProductId(product.id);
                      setEditProductName(product.name);
                      setEditProductDescription(product.description);
                      setEditProductPrice(product.price);
                      setEditProductQuantity(product.quantity);
                      setEditProductTags(product.tags);
                    }}
                  >
                    <MdEdit />
                  </button>
                  <DeleteProductButton
                    productId={product.id}
                    productImageUrl={product.image}
                    onProductDeleted={fetchProducts}
                  />
                </div>
              </div>
            </div>
            <div>
              <img
                src={product.image}
                alt={product.name}
                className="w-40 h-32 object-cover rounded-md"
              />
            </div>
          </div>
        ))}
      </div>
      </div>

      {editProductId && (
        <EditProductForm
          productId={editProductId}
          productName={editProductName}
          productDescription={editProductDescription}
          productPrice={editProductPrice}
          productQuantity={editProductQuantity}
          productTags={editProductTags}
          onUpdate={() => {
            setEditProductId(null);
            setEditProductName("");
            setEditProductDescription("")
            setEditProductPrice(0);
            setEditProductQuantity(0);
            setEditProductTags([]);
            fetchProducts();
          }}
          onCancel={() => setEditProductId(null)}
        />
      )}
    </div>
  );
};

export default AddProducts;
