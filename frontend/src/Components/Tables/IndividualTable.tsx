import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  updateDoc,
  getDoc,
  DocumentData,
} from "firebase/firestore";
import { db } from "../../Services/firebaseConfig";
import PageTitle from "../PageTitle";
import { IoBag } from "react-icons/io5";
import { FaClipboardList } from "react-icons/fa6";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import {
  addToCart,
  clearCart,
  decrementQuantity,
  incrementQuantity,
} from "../../redux/slices/cartSlice";
import { RiDeleteBin6Fill } from "react-icons/ri";
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

const IndividualTable = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const cartItems = useSelector((state: RootState) => state.cart.items);
  const [tableExists, setTableExists] = useState<boolean>(false);
  const [tableDocId, setTableDocId] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [quantities, setQuantities] = useState<{ [key: string]: number }>({});
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
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
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  useEffect(() => {
    const checkTableExists = async () => {
      try {
        const tablesCollectionRef = collection(db, "tables");
        const q = query(tablesCollectionRef, where("number", "==", id));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          navigate("/error");
          return;
        }

        const tableDoc = querySnapshot.docs[0];
        setTableDocId(tableDoc.id);
        setTableExists(true);
      } catch (error) {
        console.error(error);
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

    checkTableExists();
    fetchProducts();
  }, [id, navigate]);

  // Função para gerar um número aleatório de pedido
  const generateOrderNumber = () => {
    return Math.floor(100000 + Math.random() * 900000);
  };

  const handleAddToCart = (product: DocumentData) => {
    const quantity = quantities[product.id] || 1; // Usa a quantidade especificada pelo usuário, ou 1 se não estiver definida
    if (quantity > 0) {
      dispatch(
        addToCart({
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image || "",
          quantity,
        })
      );
      setQuantities((prev) => ({ ...prev, [product.id]: 1 })); // Reseta a quantidade após adicionar ao carrinho

      // Exibe o modal de confirmação
      setModalMessage(`${product.name} adicionado à sacola!`);
      setShowModal(true);

      setTimeout(() => {
        setShowModal(false);
      }, 3000);
    }
  };

  const handlePlaceOrder = async () => {
    if (!tableDocId || cartItems.length === 0) return;
  
    setLoading(true);
    setShowModal(false);
  
    try {
      const tableRef = doc(db, "tables", tableDocId);

      const tableDoc = await getDoc(tableRef);
  
      // Recupera a lista atual de produtos da mesa, ou um array vazio se não houver produtos
      const currentProducts = tableDoc.data()?.products || [];
  
      // Cria um novo array de produtos a partir dos itens no carrinho
      const newProducts = cartItems.map((item) => ({
        ...item,
        status: "pendente", // Define o status inicial de cada produto como "pendente"
        image: products.find((product) => product.id === item.id)?.image || "",
        orderNumber: generateOrderNumber(), // Gera um número único de pedido para cada produto
      }));
  
      // Combina os produtos existentes na mesa com os novos produtos do carrinho
      const mergedProducts = [...currentProducts, ...newProducts];
  
      await updateDoc(tableRef, {
        products: mergedProducts,
      });
  
      dispatch(clearCart());

      setModalMessage("Pedido realizado com sucesso!");
      setShowModal(true);
  
      setTimeout(() => {
        setShowModal(false);
      }, 3000);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  const handleClearCart = () => {
    dispatch(clearCart());
  };

  const totalPrice = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  const formatPrice = (priceInCents: number) => {
    const priceInReais = (priceInCents / 100).toFixed(2); // Converte para reais e formata com 2 casas decimais
    return priceInReais.replace(".", ","); // Substitui o ponto por vírgula
  };

  const handleIncrement = (productId: string) => {
    setQuantities((prev) => ({
      ...prev,
      [productId]: (prev[productId] || 1) + 1, // Incrementa a quantidade
    }));
  };

  const handleDecrement = (productId: string) => {
    setQuantities((prev) => {
      const currentQuantity = prev[productId] || 1;
      return {
        ...prev,
        [productId]: Math.max(1, currentQuantity - 1), // Decrementa a quantidade, garantindo que não fique menor que 1
      };
    });
  };

  // Agrupar produtos por tags
  const groupedProducts = products.reduce((acc, product) => {
    product.tags.forEach((tag: string) => {
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

  const totalItems = cartItems.reduce(
    (total, item) => total + item.quantity,
    0
  );

  if (!tableExists) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <FaSpinner className="animate-spin text-CC3333 h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="font-inter container mx-auto">
      <PageTitle title={`Mesa ${id}`} />

      <div className="border-b border-black lg:space-x-5 xl:space-x-10 pb-3 mb-5 flex flex-col lg:flex-row justify-center items-center mt-5 sm:mx-8">
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
          onClick={toggleModal}
          className="border border-C99F45 rounded-md text-C99F45 font-bold text-sm flex items-center justify-center w-32 h-10 mb-4 lg:mb-0 hover:bg-C99F45 hover:text-white hover:transition-transform duration-300 relative"
        >
          <IoBag className="mr-1 xl:mr-3" />
          Sacola
          {totalItems > 0 && (
            <span className=" absolute -top-2 right-1 bg-C99F45 border border-white text-white rounded-full text-xs w-5 h-5 flex items-center justify-center">
              {totalItems}
            </span>
          )}
        </button>
        <Link to={`/my-orders/${id}`}>
          <button className="border border-CC3333 rounded-md text-CC3333 font-bold text-sm flex items-center justify-center w-32 h-10 hover:bg-CC3333 hover:text-white hover:transition-transform duration-300">
            <FaClipboardList className="mr-2" />
            Meus Pedidos
          </button>
        </Link>
      </div>

      <div className="flex justify-center ">
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
                          <div className="flex flex-col sm:flex-row justify-between">
                            <p className="font-bold text-sm">
                              R$ {formatPrice(product.price)}
                            </p>
                            <div className="flex space-x-2 mt-2 sm:mt-0">
                              <div className="flex justify-around items-center border border-E6E6E rounded-md font-bold text-E6E6E text-xs px-1 h-5 sm:h-7 sm:w-14">
                                <button
                                  onClick={() => handleDecrement(product.id)}
                                >
                                  -
                                </button>
                                <input
                                  type="number"
                                  value={quantities[product.id] || 1} // Mantém o valor atual ou define como 1 se não estiver definido
                                  onChange={(e) => {
                                    const value = Math.max(
                                      1,
                                      Number(e.target.value)
                                    ); // Assegura que a quantidade seja pelo menos 1
                                    setQuantities((prev) => ({
                                      ...prev,
                                      [product.id]: value,
                                    }));
                                  }}
                                  min="0"
                                  className="w-6 text-center focus:outline-none"
                                />
                                <button
                                  onClick={() => handleIncrement(product.id)}
                                >
                                  +
                                </button>
                              </div>
                              <button
                                onClick={() => handleAddToCart(product)}
                                className="border border-C99F45 rounded-md text-C99F45 font-bold text-xs flex items-center px-1 h-5 sm:h-7 hover:bg-C99F45 hover:text-white hover:transition-transform duration-300"
                              >
                                <IoBag className="mr-1" />
                                Adicionar
                              </button>
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
              {/* Modal de confirmação */}
              {showModal && <ModalConfirmation message={modalMessage} />}
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
                            <div className="flex flex-col sm:flex-row justify-between">
                              <p className="font-bold text-sm">
                                R$ {formatPrice(product.price)}
                              </p>
                              <div className="flex space-x-2 mt-2 sm:mt-0">
                                <div className="flex justify-around items-center border border-E6E6E rounded-md font-bold text-E6E6E text-xs px-1 h-5 sm:h-7 sm:w-14">
                                  <button
                                    onClick={() => handleDecrement(product.id)}
                                  >
                                    -
                                  </button>
                                  <input
                                    type="number"
                                    value={quantities[product.id] || 1} // Mantém o valor atual ou define como 1 se não estiver definido
                                    onChange={(e) => {
                                      const value = Math.max(
                                        1,
                                        Number(e.target.value)
                                      ); // Assegura que a quantidade seja pelo menos 1
                                      setQuantities((prev) => ({
                                        ...prev,
                                        [product.id]: value,
                                      }));
                                    }}
                                    min="0"
                                    className="w-6 text-center focus:outline-none"
                                  />
                                  <button
                                    onClick={() => handleIncrement(product.id)}
                                  >
                                    +
                                  </button>
                                </div>
                                <button
                                  onClick={() => handleAddToCart(product)}
                                  className="border border-C99F45 rounded-md text-C99F45 font-bold text-xs flex items-center px-1 h-5 sm:h-7 hover:bg-C99F45 hover:text-white hover:transition-transform duration-300"
                                >
                                  <IoBag className="mr-1" />
                                  Adicionar
                                </button>
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
          {/* Modal de confirmação */}
          {showModal && <ModalConfirmation message={modalMessage} />}
        </div>
      </div>

      {isModalOpen && (
        <div
          onClick={toggleModal}
          className="fixed inset-0 flex justify-end bg-black bg-opacity-50 z-40"
        >
          <p className="z-50 ml-6 mt-2 bg-CC3333 h-7 w-7 text-center rounded-full font-bold text-white cursor-pointer">
            x
          </p>
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white -ml-14 pt-12 p-6 shadow-lg max-w-md w-full flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-9">
                <h2 className="text-2xl font-semibold">Itens Adicionados</h2>
                <RiDeleteBin6Fill
                  onClick={handleClearCart}
                  className="text-CC3333 h-5 w-5 cursor-pointer hover:scale-110 transform transition-transform duration-300"
                />
              </div>
              {cartItems.length > 0 ? (
                <ul className="space-y-4">
                  {cartItems.map((product, index) => (
                    <li
                      key={index}
                      className="flex items-center justify-between rounded-lg "
                    >
                      <div className="flex items-center">
                        <div>
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-20 h-16 object-cover rounded-md mr-5"
                          />
                        </div>
                        <div>
                          <p className="text-base font-semibold">
                            {product.name}
                          </p>
                          <p className="text-base font-medium">
                            R$ {formatPrice(product.price * product.quantity)}
                          </p>
                        </div>
                      </div>
                      <div className="flex justify-around items-center border border-E6E6E rounded-md w-20 h-9 font-bold text-E6E6E">
                        <button
                          onClick={() =>
                            dispatch(decrementQuantity({ id: product.id }))
                          }
                        >
                          -
                        </button>
                        <p>{product.quantity}</p>
                        <button
                          onClick={() =>
                            dispatch(incrementQuantity({ id: product.id }))
                          }
                        >
                          +
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-E6E6E font-semibold text-lg">
                  O carrinho está vazio.
                </p>
              )}
            </div>
            <div className="flex justify-between items-center">
              <p className="text-base font-medium text-E6E6E">
                Total{" "}
                <span className="text-lg font-medium text-black ml-3">
                  R$ {formatPrice(totalPrice)}
                </span>
              </p>
              <button
                onClick={handlePlaceOrder}
                disabled={loading}
                className={`font-medium text-white bg-CC3333 rounded-md text-sm px-5 py-3 ${
                  loading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                Fazer Pedido
                {loading && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <FaSpinner className="animate-spin text-CC3333 h-8 w-8" />
                  </div>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IndividualTable;
