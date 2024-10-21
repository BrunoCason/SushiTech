import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../Services/firebaseConfig";
import PageTitle from "../PageTitle";
import { Table, Product } from "../../Types";
import { RiDeleteBin6Fill } from "react-icons/ri";
import { FaSpinner } from "react-icons/fa";
import ModalConfirmation from "../ModalConfirmation";

const PendingProducts = () => {
  const [pendingProducts, setPendingProducts] = useState<
    { table: Table; product: Product }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [isStartingOrder, setIsStartingOrder] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [deleteModalMessage, setDeleteModalMessage] = useState("");

  useEffect(() => {
    // Função que ouve mudanças nos pedidos pendentes em tempo real
    const fetchPendingProducts = () => {
      const tablesCollectionRef = collection(db, "tables");

      // Listener em tempo real
      const unsubscribe = onSnapshot(tablesCollectionRef, (snapshot) => {
        const pendingProductsList: { table: Table; product: Product }[] = [];

        snapshot.forEach((tableDoc) => {
          const tableData = tableDoc.data();
          const table: Table = {
            id: tableDoc.id,
            number: tableData.number,
            products: tableData.products || [],
            userId: tableData.userId || "",
            status: "",
          };

          const productsWithStatusPendente = (
            table.products as Product[]
          ).filter((product: Product) => product.status === "pendente");

          for (const product of productsWithStatusPendente) {
            pendingProductsList.push({ table, product });
          }
        });

        setPendingProducts(pendingProductsList);
        setLoading(false); // Desativa o loading ao carregar os produtos
      });

      return unsubscribe;
    };

    const unsubscribe = fetchPendingProducts();

    // Limpa o listener ao desmontar o componente
    return () => unsubscribe();
  }, []);

  const handleStartOrder = async (tableId: string, orderNumber: string) => {
    setIsStartingOrder(orderNumber);
    try {
      const tableRef = doc(db, "tables", tableId);
      const tableDoc = await getDoc(tableRef);
      const currentProducts = tableDoc.data()?.products || [];

      // Atualiza o status do produto específico
      const updatedProducts = currentProducts.map((product: Product) =>
        product.orderNumber === orderNumber
          ? { ...product, status: "produção" }
          : product
      );

      await updateDoc(tableRef, { products: updatedProducts });

      // Remove o produto da lista de pendentes localmente
      setPendingProducts((prevProducts) =>
        prevProducts.filter((item) => item.product.orderNumber !== orderNumber)
      );

      setModalMessage(`Pedido #${orderNumber} iniciado!`);
      setShowModal(true);
    } catch (error) {
      console.error("Error updating product status: ", error);
    } finally {
      setIsStartingOrder(null);

      setTimeout(() => {
        setShowModal(false);
      }, 3000);
    }
  };

  const handleDeleteOrder = async (tableId: string, orderNumber: string) => {
    setLoading(true);
    try {
      const tableRef = doc(db, "tables", tableId);
      const tableDoc = await getDoc(tableRef);
      const currentProducts = tableDoc.data()?.products || [];

      // Filtra os produtos para remover o que tem o orderNumber fornecido
      const updatedProducts = currentProducts.filter(
        (product: Product) => product.orderNumber !== orderNumber
      );

      await updateDoc(tableRef, { products: updatedProducts });

      // Atualiza o estado local para remover o produto da lista pendente
      setPendingProducts((prevProducts) =>
        prevProducts.filter((item) => item.product.orderNumber !== orderNumber)
      );

      setDeleteModalMessage(`Pedido #${orderNumber} cancelado!`);
      setShowModal(true);
    } catch (error) {
      console.error("Erro ao remover o produto: ", error);
    } finally {
      setLoading(false);

      setTimeout(() => {
        setShowModal(false);
        setDeleteModalMessage("");
      }, 3000);
    }
  };

  return (
    <div className="font-inter flex justify-center container mx-auto">
      <PageTitle title="Pedidos Realizados" />

      {loading ? (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <FaSpinner className="animate-spin text-CC3333 h-8 w-8" />
        </div>
      ) : pendingProducts.length === 0 ? (
        <p className="font-bold text-E6E6E text-xl md:text-4xl mt-20">
          Sem produtos pendentes
        </p>
      ) : (
        <div className="flex justify-center mb-5">
          <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-y-5 gap-x-8 mt-14">
            {pendingProducts.map((item, index) => (
              <div
                key={index}
                className="flex justify-between border mx-3 sm:mx-0 sm:w-432px border-A7A7A7 rounded-md shadow-md p-3"
              >
                <div className="w-56">
                  <p className="font-bold text-lg mb-1">
                    Mesa {item.table.number} - {item.product.name}
                  </p>
                  <div>
                    <p className="font-medium text-E6E6E text-sm mb-2">
                      Quantidade: {item.product.quantity}
                    </p>
                    <p className="font-medium text-E6E6E text-sm">
                      Pedido #{item.product.orderNumber}
                    </p>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <button
                      onClick={() =>
                        handleStartOrder(
                          item.table.id,
                          item.product.orderNumber
                        )
                      }
                      className="border border-CC3333 rounded-md text-CC3333 font-bold text-sm p-2 hover:bg-CC3333 hover:font-bold hover:text-white hover:transition-transform duration-300"
                    >
                      {isStartingOrder === item.product.orderNumber ? (
                        <FaSpinner className="animate-spin h-5 w-5" />
                      ) : (
                        "Iniciar Pedido"
                      )}
                    </button>
                    <RiDeleteBin6Fill
                      onClick={() =>
                        handleDeleteOrder(
                          item.table.id,
                          item.product.orderNumber
                        )
                      }
                      className="text-CC3333 h-5 w-5 cursor-pointer mr-5 sm:mr-0 hover:scale-110 transform transition-transform duration-300"
                    />
                    {loading && (
                      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <FaSpinner className="animate-spin text-CC3333 h-8 w-8" />
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-40 h-full sm:h-32 object-cover rounded-md"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showModal && (
        <ModalConfirmation message={modalMessage || deleteModalMessage} />
      )}
    </div>
  );
};

export default PendingProducts;
