import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { collection, getDocs, query, where, doc, updateDoc, getDoc, DocumentData } from "firebase/firestore";
import { db } from "../../Services/firebaseConfig";
import PageTitle from "../PageTitle";
import { IoBag } from "react-icons/io5";
import { FaClipboardList } from "react-icons/fa6";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { addToCart, clearCart, decrementQuantity, incrementQuantity } from "../../redux/slices/cartSlice";
import { RiDeleteBin6Fill } from "react-icons/ri";

const IndividualTable = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const cartItems = useSelector((state: RootState) => state.cart.items);
  const [tableExists, setTableExists] = useState<boolean>(false);
  const [products, setProducts] = useState<DocumentData[]>([]);
  const [tableDocId, setTableDocId] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [quantities, setQuantities] = useState<{ [key: string]: number }>({});

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
        console.error("Error checking table existence: ", error);
      }
    };

    const fetchProducts = async () => {
      try {
        const productsCollectionRef = collection(db, "products");
        const querySnapshot = await getDocs(productsCollectionRef);
        const productsList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setProducts(productsList);
      } catch (error) {
        console.error("Error fetching products: ", error);
      }
    };

    checkTableExists();
    fetchProducts();
  }, [id, navigate]);

  // Função para gerar um número aleatório de pedido
  const generateOrderNumber = () => {
    return Math.floor(100000 + Math.random() * 900000); // Número aleatório de 6 dígitos
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
          quantity, // Adiciona a quantidade ao carrinho
        })
      );
      setQuantities((prev) => ({ ...prev, [product.id]: 1 })); // Reseta a quantidade após adicionar ao carrinho
      console.log("Product added to cart successfully!");
    }
  };

  const handlePlaceOrder = async () => {
    if (!tableDocId || cartItems.length === 0) return;

    try {
      const tableRef = doc(db, "tables", tableDocId);
      const tableDoc = await getDoc(tableRef);
      const currentProducts = tableDoc.data()?.products || [];

      const orderNumber = generateOrderNumber(); // Gerar um número de pedido

      // Cria um novo array de produtos que inclui os produtos do carrinho
      const newProducts = cartItems.map((item) => ({
        ...item,
        status: "pendente", // Todos os novos produtos começam como pendentes
        image: products.find((product) => product.id === item.id)?.image || "",
        orderNumber, // Adiciona o número do pedido ao novo produto
      }));

      // Atualiza a lista de produtos, garantindo que os novos produtos sejam adicionados
      const mergedProducts = [...currentProducts, ...newProducts]; // Combina produtos atuais com novos

      await updateDoc(tableRef, {
        products: mergedProducts, // Atualiza a lista de produtos com os novos e existentes
      });

      dispatch(clearCart());
      console.log("Pedido feito com sucesso!");
    } catch (error) {
      console.error("Erro ao fazer o pedido: ", error);
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

  if (!tableExists) {
    return <div className="text-center text-xl mt-10">Loading...</div>;
  }

  return (
    <div className="p-6 font-inter container mx-auto">
      <PageTitle title={`Mesa ${id}`} />
      <div className="flex justify-end space-x-6 border-b border-black pb-3 mb-3">
        <button
          onClick={toggleModal}
          className="border border-C99F45 rounded-md text-C99F45 font-bold text-sm flex items-center justify-center w-32 h-8"
        >
          <IoBag className="mr-3" />
          Sacola
        </button>

        <Link to={`/my-orders/${id}`}>
          <button className="border border-CC3333 rounded-md text-CC3333 font-bold text-sm flex items-center justify-center w-32 h-8">
            <FaClipboardList className="mr-2" />
            Meus Pedidos
          </button>
        </Link>
      </div>

      {isModalOpen && (
        <div
          onClick={toggleModal}
          className="fixed inset-0 flex justify-end bg-black bg-opacity-50 z-50"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white p-6 shadow-lg max-w-md w-full flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-9">
                <h2 className="text-2xl font-semibold">Itens Adicionados</h2>
                <RiDeleteBin6Fill
                  onClick={handleClearCart}
                  className="text-CC3333 h-5 w-5 cursor-pointer"
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
                            R$ {(product.price * product.quantity).toFixed(2)}
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
                  R$ {totalPrice.toFixed(2)}
                </span>
              </p>
              <button
                onClick={handlePlaceOrder}
                className="font-medium text-white bg-CC3333 rounded-md text-sm px-5 py-3"
              >
                Fazer Pedido
              </button>
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
                <p className="font-medium text-sm text-E6E6E h-16 text-justify">
                  {product.description}
                </p>
                <div className="flex justify-between">
                  <p className="font-bold text-sm">R$ {product.price}</p>
                  <div className="flex space-x-2">
                    <div className="flex justify-around items-center border border-E6E6E rounded-md font-bold text-E6E6E text-xs px-1 py-1 w-14">
                      <button onClick={() => handleDecrement(product.id)}>
                        -
                      </button>
                      <input
                        type="number"
                        value={quantities[product.id] || 1} // Mantém o valor atual ou define como 1 se não estiver definido
                        onChange={(e) => {
                          const value = Math.max(1, Number(e.target.value)); // Assegura que a quantidade seja pelo menos 1
                          setQuantities((prev) => ({
                            ...prev,
                            [product.id]: value,
                          }));
                        }}
                        min="0"
                        className="w-6 text-center focus:outline-none"
                      />
                      <button onClick={() => handleIncrement(product.id)}>
                        +
                      </button>
                    </div>
                    <button
                      onClick={() => handleAddToCart(product)}
                      className="border border-C99F45 rounded-md text-C99F45 font-bold text-xs flex items-center px-1 py-1"
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
                  className="w-40 h-32 object-cover rounded-md"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default IndividualTable;
