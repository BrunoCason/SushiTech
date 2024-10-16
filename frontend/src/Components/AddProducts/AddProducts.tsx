import React, { useState, useEffect } from "react";
import { collection, addDoc, getDocs } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../../Services/firebaseConfig";
import PageTitle from "../PageTitle";
import DeleteProductButton from "./DeleteProductButton";
import EditProductForm from "./EditProductForm";
import { MdEdit } from "react-icons/md";
import { IoMdAdd, IoMdImage } from "react-icons/io";
import { FaSearch } from "react-icons/fa";

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
  const [productImage, setProductImage] = useState<File | null>(null);
  const [productTags, setProductTags] = useState<string[]>([]);
  const [products, setProducts] = useState<{
    id: string;
    name: string;
    description: string;
    price: number;
    image: string;
    tags: string[];
  }[]>([]);
  const [editProductId, setEditProductId] = useState<string | null>(null);
  const [editProductName, setEditProductName] = useState<string>("");
  const [editProductDescription, setEditProductDescription] = useState<string>("");
  const [editProductPrice, setEditProductPrice] = useState<number>(0);
  const [editProductTags, setEditProductTags] = useState<string[]>([]);
  const [showTagsMenu, setShowTagsMenu] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const handleAddProduct = async () => {
    if (productName && productDescription && productPrice > 0 && productImage) {
      try {
        const imageRef = ref(storage, `products/${productImage.name}`);
        const snapshot = await uploadBytes(imageRef, productImage);
        const imageUrl = await getDownloadURL(snapshot.ref);

        await addDoc(collection(db, "products"), {
          name: productName,
          description: productDescription,
          price: productPrice,
          image: imageUrl,
          tags: productTags,
        });
        console.log("Product added successfully!");
        setProductName("");
        setProductDescription("");
        setProductPrice(0);
        setProductImage(null);
        setProductTags([]);
        fetchProducts();
        setIsModalOpen(false); // Fecha o modal após adicionar o produto
      } catch (error) {
        console.error("Error adding product: ", error);
      }
    } else {
      console.log("Please enter product name, price and upload an image.");
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

  // Filtrar produtos pela tag selecionada
  const filteredProducts = selectedTag
    ? products.filter((product) => product.tags.includes(selectedTag))
    : products;

  // Agrupar produtos por tags
  const groupedProducts = products.reduce((acc, product) => {
    product.tags.forEach((tag) => {
      if (!acc[tag]) {
        acc[tag] = [];
      }
      acc[tag].push(product);
    });
    return acc;
  }, {} as Record<string, typeof products>);

  return (
    <div className="container mx-auto mt-32 font-inter">
      <PageTitle title="Produtos" />

      <div className="border-b border-black pb-3 mb-5 flex ">
        {tagsOptions.map((tag) => (
          <span
            key={tag}
            onClick={() => setSelectedTag(tag)}
            className={`bg-gray-200 text-CC3333 rounded-full px-3 py-1 text-sm mr-2 mb-2 cursor-pointer hover:bg-gray-300 ${
              selectedTag === tag ? "font-bold" : ""
            }`}
          >
            {tag}
          </span>
        ))}
        <div className="flex items-center border border-A7A7A7 rounded-md mr-5">
          <FaSearch className="text-CC3333 ml-3" />
          <input
            type="text"
            className="text-sm font-normal text-A7A7A7 focus:outline-none pl-5"
            placeholder="Busque por item"
          />
        </div>
        <button
          className="flex justify-center items-center text-sm w-40 mb-7 sm:mb-0 p-2 font-bold text-CC3333 border border-CC3333 rounded-md"
          onClick={() => setIsModalOpen(true)}
        >
          <IoMdAdd className="h-4 w-4" />
          Adicionar Produto
        </button>
      </div>

      <div className="flex justify-center">
        <div className="font-inter">
          {selectedTag
            ? (
              <div className="mb-10">
                <h3 className="font-bold text-xl mb-4 mx-3 sm:mx-0">{selectedTag}</h3>
                {filteredProducts.length > 0 ? (
                  <div className="flex">
                    <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-y-5 gap-x-8">
                      {filteredProducts.map((product) => (
                        <div
                          key={product.id}
                          className="flex justify-between border mx-3 sm:mx-0 sm:w-432px h-156px border-A7A7A7 rounded-md shadow-md p-3"
                        >
                          <div className="w-56 mr-3 sm:mr-0">
                            <p className="font-bold text-lg mb-2">
                              {product.name}
                            </p>
                            <p className="font-medium text-sm text-E6E6E h-16 text-justify">
                              {product.description}
                            </p>
                            <div className="flex justify-between">
                              <p className="font-bold text-sm">
                                R$ {product.price}
                              </p>
                              <div className="space-x-4">
                                <button
                                  onClick={() => {
                                    setEditProductId(product.id);
                                    setEditProductName(product.name);
                                    setEditProductDescription(
                                      product.description
                                    );
                                    setEditProductPrice(product.price);
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
                ) : (
                  <p className="text-gray-500">Nenhum produto disponível.</p>
                )}
              </div>
            ) : (
              Object.keys(groupedProducts).map((tag) => (
                <div key={tag} className="mb-10">
                  <h3 className="font-bold text-xl mb-4 mx-3 sm:mx-0">{tag}</h3>
                  {groupedProducts[tag].length > 0 ? (
                    <div className="flex">
                      <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-y-5 gap-x-8">
                        {groupedProducts[tag].map((product) => (
                          <div
                            key={product.id}
                            className="flex justify-between border mx-3 sm:mx-0 sm:w-432px h-156px border-A7A7A7 rounded-md shadow-md p-3"
                          >
                            <div className="w-56 mr-3 sm:mr-0">
                              <p className="font-bold text-lg mb-2">
                                {product.name}
                              </p>
                              <p className="font-medium text-sm text-E6E6E h-16 text-justify">
                                {product.description}
                              </p>
                              <div className="flex justify-between">
                                <p className="font-bold text-sm">
                                  R$ {product.price}
                                </p>
                                <div className="space-x-4">
                                  <button
                                    onClick={() => {
                                      setEditProductId(product.id);
                                      setEditProductName(product.name);
                                      setEditProductDescription(
                                        product.description
                                      );
                                      setEditProductPrice(product.price);
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
                  ) : (
                    <p className="text-gray-500">Nenhum produto disponível.</p>
                  )}
                </div>
              ))
            )}
        </div>
      </div>

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
                  className="flex flex-col justify-center items-center w-64 h-96 bg-gray-300 rounded-md cursor-pointer"
                >
                  <IoMdImage className="w-60 h-60 text-gray-600" />
                </label>
              </div>
              <div className="w-72">
                <p className="font-medium text-xl mb-4">Adicionar Produto</p>
                <p className="font-medium text-lg">Nome</p>
                <input
                  type="text"
                  placeholder="Nome do produto"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className="border-b border-black focus:outline-none text-BCBCBC text-base font-normal w-full"
                />
                <p className="font-medium text-lg mt-4">Descrição</p>
                <input
                  type="text"
                  placeholder="Descrição do produto"
                  value={productDescription}
                  onChange={(e) => setProductDescription(e.target.value)}
                  className="border-b border-black focus:outline-none text-BCBCBC text-base font-normal w-full"
                />
                <p className="font-medium text-lg mt-4">Preço</p>
                <input
                  type="number"
                  placeholder="R$"
                  value={productPrice}
                  onChange={(e) => setProductPrice(Number(e.target.value))}
                  className="border-b border-black focus:outline-none text-BCBCBC text-base font-normal w-full"
                />
                <div className="flex justify-between mt-3">
                  <div className="my-4 flex">
                    <p className="font-medium text-lg mb-5">Categoria</p>
                    <button
                      onClick={() => setShowTagsMenu(!showTagsMenu)}
                      className="border border-black rounded-md w-24 h-9 ml-3"
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

      {editProductId && (
        <EditProductForm
          productId={editProductId}
          productName={editProductName}
          productDescription={editProductDescription}
          productPrice={editProductPrice}
          productTags={editProductTags}
          onUpdate={() => {
            setEditProductId(null);
            setEditProductName("");
            setEditProductDescription("");
            setEditProductPrice(0);
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
