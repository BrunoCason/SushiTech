import { useState, useEffect } from "react";
import { collection, addDoc, getDocs } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../../Services/firebaseConfig";
import PageTitle from "../PageTitle";
import DeleteProductButton from "./DeleteProductButton";
import EditProductForm from "./EditProductForm";
import { MdEdit } from "react-icons/md";
import { IoMdAdd, IoMdImage } from "react-icons/io";
import { FaSearch, FaSpinner } from "react-icons/fa";
import ModalConfirmation from "../ModalConfirmation";

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

const AddProducts = () => {
  const [productName, setProductName] = useState<string>("");
  const [productPrice, setProductPrice] = useState<string>("");
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
  const [tagInput, setTagInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [productNameInvalid, setProductNameInvalid] = useState(false);
  const [productDescriptionInvalid, setProductDescriptionInvalid] =
    useState(false);
  const [productPriceInvalid, setProductPriceInvalid] = useState(false);
  const [productImageInvalid, setProductImageInvalid] = useState(false);
  const [productTagsInvalid, setProductTagsInvalid] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);

  const handleAddProduct = async () => {
    // Converte o preço para centavos
    const priceInCents =
      parseFloat(productPrice.replace("R$", "").replace(",", ".").trim()) * 100;

    // Reseta os estados de erro
    setProductNameInvalid(false);
    setProductDescriptionInvalid(false);
    setProductPriceInvalid(false);
    setProductImageInvalid(false);
    setProductTagsInvalid(false);

    // Verifica se os campos obrigatórios estão preenchidos
    let hasError = false;

    if (!productName) {
      setProductNameInvalid(true);
      hasError = true;
    }
    if (!productDescription) {
      setProductDescriptionInvalid(true);
      hasError = true;
    }
    if (priceInCents <= 0 || isNaN(priceInCents)) {
      setProductPriceInvalid(true);
      hasError = true;
    }
    if (!productImage) {
      setProductImageInvalid(true);
      hasError = true;
    }
    if (productTags.length === 0) {
      setProductTagsInvalid(true);
      hasError = true;
    }

    if (hasError) {
      return; // Interrompe a execução se houver erros
    }

    setLoading(true);

    try {
      let imageUrl = "";

      if (productImage) {
        // Realiza o upload da imagem
        const imageRef = ref(storage, `products/${productImage.name}`);
        const snapshot = await uploadBytes(imageRef, productImage);
        imageUrl = await getDownloadURL(snapshot.ref);
      }

      // Adiciona o produto ao Firestore
      await addDoc(collection(db, "products"), {
        name: productName,
        description: productDescription,
        price: priceInCents,
        image: imageUrl,
        tags: productTags,
      });

      setModalMessage("Produto adicionado com sucesso!");
      setIsModalVisible(true);

      // Limpa os campos após o sucesso
      setProductName("");
      setProductDescription("");
      setProductPrice("");
      setProductImage(null);
      setPreviewImageUrl(null);
      setTagInput("");
      setProductTags([]);
      fetchProducts();

      // Define um timeout para fechar o modal após 3 segundos
      setTimeout(() => {
        setIsModalVisible(false);
      }, 3000);
    } catch (error) {
      console.error(error);
      setModalMessage("Erro ao adicionar o produto.");
      setIsModalVisible(true);

      // Fecha o modal de erro após 3 segundos
      setTimeout(() => {
        setIsModalVisible(false);
      }, 3000);
    } finally {
      setLoading(false);
      setIsModalOpen(false);
    }
  };

  const formatPrice = (priceInCents: number) => {
    const priceInReais = (priceInCents / 100).toFixed(2); // Converte para reais e formata com 2 casas decimais
    return priceInReais.replace(".", ","); // Substitui o ponto por vírgula
  };

  const mascaraMoeda = (event: React.ChangeEvent<HTMLInputElement>) => {
    const onlyDigits = event.target.value
      .split("")
      .filter((s) => /\d/.test(s))
      .join("")
      .padStart(3, "0"); // Garante ao menos 3 dígitos

    const digitsFloat = onlyDigits.slice(0, -2) + "." + onlyDigits.slice(-2); // Formata como valor decimal

    // Atualiza o valor formatado no input e no estado
    setProductPrice(maskCurrency(parseFloat(digitsFloat)));
  };

  const maskCurrency = (valor: number, locale = "pt-BR", currency = "BRL") => {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
    }).format(valor); // Formata no estilo de moeda (R$ 0,00)
  };

  const fetchProducts = async () => {
    setLoading(true);
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
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleTagEditSelect = (tag: string) => {
    if (!productTags.includes(tag)) {
      // Adiciona a tag se não estiver presente
      setProductTags((prevTags) => [...prevTags, tag]);
    } else {
      // Remove a tag se já estiver presente
      setProductTags((prevTags) => prevTags.filter((t) => t !== tag));
    }
    setTagInput(tag); // Atualiza o input com a tag selecionada
    setShowTagsMenu(false); // Fecha o menu
  };

  const handleTagInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTagInput(e.target.value);
    // Exibe o menu apenas se houver texto no input
    setShowTagsMenu(e.target.value.length > 0);
  };

  const filteredTags = tagsOptions.filter((tag) =>
    tag.toLowerCase().includes(tagInput.toLowerCase())
  );

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

  // Função para lidar com a mudança da imagem
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    setProductImage(file);

    if (file) {
      const imageUrl = URL.createObjectURL(file); // Gerar a URL temporária da imagem
      setPreviewImageUrl(imageUrl); // Atualizar o estado de visualização
    } else {
      setPreviewImageUrl(null); // Limpar a visualização se não houver arquivo
    }
  };

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
              className={`text-CC3333 rounded-full px-3 py-1 text-sm mr-2 mb-2 cursor-pointer hover:bg-CC3333 hover:font-bold hover:text-white hover:transition-transform duration-300 ${
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
          className="flex justify-center items-center text-sm w-44 h-10 p-2 font-bold text-CC3333 border border-CC3333 rounded-md  hover:bg-CC3333 hover:text-white hover:transition-transform duration-300"
          onClick={() => setIsModalOpen(true)}
        >
          <IoMdAdd className="h-4 w-4" />
          Adicionar Produto
        </button>
      </div>

      <div className="flex justify-center">
        <div className="font-inter">
          {loading ? (
            <div className="flex justify-center mt-20 items-center h-20">
              <FaSpinner className="animate-spin h-10 w-10 text-CC3333" />
            </div>
          ) : selectedTags.length > 0 || searchTerm ? (
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
                                <MdEdit className="hover:scale-110 transform transition-transform duration-300"/>
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
          ) : Object.keys(groupedProducts).length > 0 ? (
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
                                  <MdEdit className="hover:scale-110 transform transition-transform duration-300"/>
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
          ) : (
            <p className="text-E6E6E font-bold">
              Nenhum produto foi adicionado
            </p>
          )}
        </div>
      </div>

      {isModalOpen && (
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
                  className={`flex flex-col justify-center items-center w-24 sm:w-48 h-96 rounded-md cursor-pointer ${
                    productImageInvalid
                      ? "border border-red-500 bg-gray-300"
                      : "bg-gray-300"
                  }`}
                >
                  {previewImageUrl ? (
                    <img
                      src={previewImageUrl}
                      alt="Preview"
                      className="w-full h-full object-cover opacity-50 rounded-md"
                    />
                  ) : (
                    <IoMdImage className="w-20 sm:w-32 h-60 text-gray-600" />
                  )}
                </label>
              </div>

              <div className="sm:w-72 flex flex-col justify-center">
                <p className="font-medium text-xl mb-4">Adicionar Produto</p>
                <p className="font-medium text-lg">Nome</p>
                <input
                  type="text"
                  placeholder="Nome do produto"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className={`border-b  focus:outline-none text-BCBCBC text-base font-normal sm:w-full ${
                    productNameInvalid ? "border-red-500" : "border-black"
                  }`}
                />
                <p className="font-medium text-lg mt-4">Descrição</p>
                <input
                  type="text"
                  placeholder="Descrição do produto"
                  value={productDescription}
                  onChange={(e) => setProductDescription(e.target.value)}
                  className={`border-b focus:outline-none text-BCBCBC text-base font-normal sm:w-full ${
                    productDescriptionInvalid
                      ? "border-red-500"
                      : "border-black"
                  }`}
                />
                <p className="font-medium text-lg mt-4">Preço</p>
                <input
                  type="text"
                  onChange={mascaraMoeda}
                  value={productPrice}
                  className={`border-b  focus:outline-none text-BCBCBC text-base font-normal sm:w-full ${
                    productPriceInvalid ? "border-red-500" : "border-black"
                  }`}
                  placeholder="R$ 0,00"
                />
                <div className="flex justify-between mt-3">
                  <div className="mb-4 relative">
                    <p className="font-medium text-lg">Categoria</p>
                    <input
                      type="text"
                      placeholder="Insira a categoria"
                      value={tagInput}
                      onChange={handleTagInputChange}
                      className={`border-b focus:outline-none text-BCBCBC text-base font-normal sm:w-72 ${
                        productTagsInvalid ? "border-red-500" : "border-black"
                      }`}
                    />
                    {showTagsMenu && tagInput && (
                      <div className="absolute z-10 bg-white border border-gray-300 rounded-lg shadow-lg mt-1 w-48">
                        {filteredTags.map((tag) => (
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
                    {loading && (
                      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <FaSpinner className="animate-spin text-CC3333 h-8 w-8" />
                      </div>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {isModalVisible && <ModalConfirmation message={modalMessage} />}

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

            // Exibir a mensagem de confirmação
            setModalMessage("Produto editado com sucesso!");
            setIsModalVisible(true);
            setTimeout(() => setIsModalVisible(false), 3000);
          }}
          onCancel={() => setEditProductId(null)}
        />
      )}

      {isModalVisible && <ModalConfirmation message={modalMessage} />}
    </div>
  );
};

export default AddProducts;
