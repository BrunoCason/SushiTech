import { useState, useEffect } from "react";
import { collection, addDoc, getDocs } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../../Services/firebaseConfig";
import PageTitle from "../PageTitle";
import DeleteProductButton from "./DeleteProductButton";
import EditProductForm from "./EditProductForm";
import { MdEdit } from "react-icons/md";
import { IoMdAdd, IoMdImage } from "react-icons/io";
import { FaSearch } from "react-icons/fa";
import MaskedInput from "react-text-mask";

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

const AddProducts = () => {
  const [productName, setProductName] = useState<string>("");
  const [productPrice, setProductPrice] = useState<string>("")
  const [productDescription, setProductDescription] = useState<string>("");
  const [productImage, setProductImage] = useState<File | null>(null);
  const [productTags, setProductTags] = useState<string[]>([]);
  const [products, setProducts] = useState<
    {
      id: string;
      name: string;
      description: string;
      price: number;
      image: string;
      tags: string[];
    }[]
  >([]);
  const [editProductId, setEditProductId] = useState<string | null>(null);
  const [editProductName, setEditProductName] = useState<string>("");
  const [editProductDescription, setEditProductDescription] =
    useState<string>("");
  const [editProductPrice, setEditProductPrice] = useState<number>(0);
  const [editProductTags, setEditProductTags] = useState<string[]>([]);
  const [showTagsMenu, setShowTagsMenu] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");

  const handlePriceChange = (value: string) => {
    // Remove caracteres não numéricos, exceto a vírgula
    const numericValue = value.replace(/[^\d]/g, '');
  
    // Lógica para formatar o preço
    if (numericValue.length === 0) {
      setProductPrice("0,00"); // Se não houver entrada, exibe 0,00
    } else if (numericValue.length < 3) {
      // Se menos de 3 dígitos, formate para 0,0X
      setProductPrice(`0,0${numericValue.padStart(1, '0')}`); // Garante pelo menos 1 dígito
    } else {
      // Formata como R$ 0,00
      const reais = numericValue.slice(0, -2) || "0"; // Os últimos 2 são os centavos
      const centavos = numericValue.slice(-2).padStart(2, '0'); // Garante que tenha 2 dígitos
      setProductPrice(`${reais},${centavos}`);
    }
  };
  
  // Função para adicionar o produto
  const handleAddProduct = async () => {
    const priceInCents = parseFloat(productPrice.replace(',', '.')) * 100; // Converter para centavos
    if (productName && productDescription && priceInCents > 0 && productImage) {
      try {
        const imageRef = ref(storage, `products/${productImage.name}`);
        const snapshot = await uploadBytes(imageRef, productImage);
        const imageUrl = await getDownloadURL(snapshot.ref);
  
        await addDoc(collection(db, "products"), {
          name: productName,
          description: productDescription,
          price: priceInCents, // Armazenar em centavos
          image: imageUrl,
          tags: productTags,
        });
        console.log("Product added successfully!");
        setProductName("");
        setProductDescription("");
        setProductPrice(""); // Limpar o campo de preço
        setProductImage(null);
        setProductTags([]);
        fetchProducts();
        setIsModalOpen(false);
      } catch (error) {
        console.error("Error adding product: ", error);
      }
    } else {
      console.log("Please enter product name, price and upload an image.");
    }
  };

  const formatPrice = (priceInCents: number) => {
    const priceInReais = (priceInCents / 100).toFixed(2); // Converte para reais e formata com 2 casas decimais
    return priceInReais.replace('.', ','); // Substitui o ponto por vírgula
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

  // Filtrar produtos pela tag selecionada e barra de pesquisa
  const filteredProducts = products
    .filter((product) =>
      selectedTags.length > 0
        ? selectedTags.some((tag) => product.tags.includes(tag))
        : true
    )
    .filter((product) =>
      searchTerm
        ? product.name.toLowerCase().includes(searchTerm.toLowerCase())
        : true
    );

  return (
    <div className="container mx-auto mt-20 font-inter">
      <PageTitle title="Produtos" />

      <div className="border-b border-black lg:space-x-5 xl:space-x-10 pb-3 mb-5 flex flex-col lg:flex-row justify-center items-center mt-5 sm:mx-10">
        <div className="p-1 flex flex-wrap justify-center">
          {tagsOptions.map((tag) => (
            <span
              key={tag}
              onClick={() =>
                setSelectedTags((prevSelectedTags) => {
                  // Verifica se a tag já está selecionada
                  if (prevSelectedTags.includes(tag)) {
                    // Remove a tag se já estiver selecionada
                    return prevSelectedTags.filter(
                      (selectedTag) => selectedTag !== tag
                    );
                  } else {
                    // Adiciona a tag se não estiver selecionada
                    return [...prevSelectedTags, tag];
                  }
                })
              }
              className={`text-CC3333 rounded-full px-3 py-1 text-sm mr-2 mb-2 cursor-pointer ${
                selectedTags.includes(tag)
                  ? "font-bold text-white bg-CC3333"
                  : ""
              }`}
            >
              {tag}
            </span>
          ))}
        </div>
        <div className="flex justify-center items-center border border-A7A7A7 rounded-md h-10 mb-4 lg:mb-0">
          <FaSearch className="text-CC3333 ml-3" />
          <input
            type="text"
            className="text-sm font-normal text-A7A7A7 focus:outline-none pl-14 lg:pl-3"
            placeholder="Busque por item"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)} 
          />
        </div>
        <button
          className="flex justify-center items-center text-sm w-44 h-10 p-2 font-bold text-CC3333 border border-CC3333 rounded-md"
          onClick={() => setIsModalOpen(true)}
        >
          <IoMdAdd className="h-4 w-4" />
          Adicionar Produto
        </button>
      </div>

      <div className="flex justify-center">
        <div className="font-inter">
          {selectedTags.length > 0 || searchTerm ? (
            <div className="mb-10">
              <h3 className="font-bold text-xl mb-4 mx-3 sm:mx-0">
                {selectedTags.join(" / ")}
              </h3>
              {filteredProducts.length > 0 ? (
                <div className="flex">
                  <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-y-5 gap-x-8">
                    {filteredProducts.map((product) => (
                      <div
                        key={product.id}
                        className="flex justify-between border mx-3 sm:mx-0 sm:w-432px border-A7A7A7 rounded-md shadow-md p-3"
                      >
                        <div className="w-56 mr-3 sm:mr-0">
                          <p className="font-bold text-lg mb-2">
                            {product.name}
                          </p>
                          <p className="font-medium text-sm text-E6E6E h-16 text-justify mb-10 sm:mb-0">
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
                            className="w-40 h-full sm:h-32 object-cover rounded-md"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-E6E6E font-bold">
                  Nenhum produto encontrado
                </p>
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
                          className="flex justify-between border mx-3 sm:mx-0 sm:w-432px border-A7A7A7 rounded-md shadow-md p-3"
                        >
                          <div className="w-56 mr-3 sm:mr-0">
                            <p className="font-bold text-lg mb-2">
                              {product.name}
                            </p>
                            <p className="font-medium text-sm text-E6E6E h-16 text-justify mb-10 sm:mb-0">
                              {product.description}
                            </p>
                            <div className="flex justify-between">
                              <p className="font-bold text-sm">
                                R$ {formatPrice(product.price)}
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
                              className="w-40 h-full sm:h-32 object-cover rounded-md"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500">Nenhum produto disponível</p>
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
                <MaskedInput
  mask={[/\d/, ',', /\d/, /\d/]} // 3 dígitos seguidos de 2 dígitos após a vírgula
  value={productPrice}
  onChange={(e) => handlePriceChange(e.target.value)}
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
