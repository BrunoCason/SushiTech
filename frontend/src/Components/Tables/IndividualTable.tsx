import React, { useEffect, useState } from "react";
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

const IndividualTable: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tableExists, setTableExists] = useState<boolean>(false);
  const [products, setProducts] = useState<DocumentData[]>([]);
  const [tableProducts, setTableProducts] = useState<DocumentData[]>([]);
  const [tableDocId, setTableDocId] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);

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

        const tableData = tableDoc.data();
        if (tableData && tableData.products) {
          setTableProducts(tableData.products);
        }
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

  const handleAddToCart = (product: DocumentData) => {
    const instanceId = `${product.id}-${Date.now()}`;
    const productWithStatus = { ...product, status: "pendente", instanceId };
    const updatedTableProducts = [...tableProducts, productWithStatus];

    setTableProducts(updatedTableProducts);
    localStorage.setItem(`cart-${id}`, JSON.stringify(updatedTableProducts)); // Salva no localStorage
    console.log("Product added to local cart successfully!");
  };

  const handleRemoveFromCart = (product: DocumentData) => {
    const updatedTableProducts = tableProducts.filter(
      (p) => p.instanceId !== product.instanceId
    );

    setTableProducts(updatedTableProducts);
    localStorage.setItem(`cart-${id}`, JSON.stringify(updatedTableProducts)); // Salva no localStorage
    console.log("Product removed from local cart successfully!");
  };

  const handlePlaceOrder = async () => {
    if (!tableDocId || tableProducts.length === 0) return;

    try {
      const tableRef = doc(db, "tables", tableDocId);
      const tableDoc = await getDoc(tableRef);
      const currentProducts = tableDoc.data()?.products || [];

      const updatedProducts = [...currentProducts, ...tableProducts];

      await updateDoc(tableRef, { products: updatedProducts });

      // Limpar a sacola após o pedido
      setTableProducts([]); // Limpa o estado local
      localStorage.removeItem(`cart-${id}`); // Remove os itens do localStorage
      console.log("Pedido feito com sucesso!");
    } catch (error) {
      console.error("Erro ao fazer o pedido: ", error);
    }
  };

  // Carregar produtos do localStorage quando o componente é montado
  useEffect(() => {
    const storedCart = localStorage.getItem(`cart-${id}`);
    if (storedCart) {
      setTableProducts(JSON.parse(storedCart));
    }
  }, [id]);

  if (!tableExists) {
    return <div className="text-center text-xl mt-10">Loading...</div>;
  }

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  return (
    <div className="p-6 font-inter container mx-auto">
      <PageTitle title={`Mesa ${id}`} />
      <button
        onClick={toggleModal}
        className="border border-C99F45 rounded-md text-C99F45 font-bold text-sm flex items-center px-3 py-1"
      >
        <IoBag className="mr-1" />
        Sacola
      </button>

      <Link to={`/my-orders/${id}`}>
        <button className="border border-CC3333 rounded-md text-CC3333 font-bold text-sm flex items-center px-3 py-1">
          <FaClipboardList />
          Meus Pedidos
        </button>
      </Link>

      {isModalOpen && (
        <div
          onClick={toggleModal}
          className="fixed inset-0 flex justify-end bg-black bg-opacity-50 z-50"
        >
          <div onClick={(e) => e.stopPropagation()} className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h2 className="text-2xl font-semibold mb-4">Produtos no Carrinho</h2>
            {tableProducts.length > 0 ? (
              <ul className="space-y-4">
                {tableProducts.map((product, index) => (
                  <li
                    key={index}
                    className="flex justify-between items-center bg-gray-100 p-4 rounded-lg"
                  >
                    <div>
                      <h3 className="text-lg font-semibold">{product.name}</h3>
                      <p>Quantidade: {product.quantity}</p>
                      <p>Status: {product.status}</p>
                    </div>
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-16 h-16 object-cover rounded-md"
                    />
                    <button
                      onClick={() => handleRemoveFromCart(product)}
                      className="font-medium text-white bg-red-500 rounded-md text-sm px-3 py-1"
                    >
                      Remover
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">O carrinho está vazio.</p>
            )}
            <div>
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
                  <div className="">
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
