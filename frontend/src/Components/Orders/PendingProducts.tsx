import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
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

  useEffect(() => {
    const fetchPendingProducts = async () => {
      try {
        const tablesCollectionRef = collection(db, "tables");
        const tablesSnapshot = await getDocs(tablesCollectionRef);

        const pendingProductsList: { table: Table; product: Product }[] = [];

        for (const tableDoc of tablesSnapshot.docs) {
          const tableData = tableDoc.data();
          const table: Table = {
            id: tableDoc.id,
            number: tableData.number,
            products: tableData.products || [],
            userId: tableData.userId || "",
          };

          const productsWithStatusPendente = (
            table.products as Product[]
          ).filter((product: Product) => product.status === "pendente");

          for (const product of productsWithStatusPendente) {
            pendingProductsList.push({ table, product });
          }
        }

        setPendingProducts(pendingProductsList);
      } catch (error) {
        console.error("Error fetching pending products: ", error);
      } finally {
        setLoading(false); // Desativa o loading ao carregar os produtos
      }
    };

    fetchPendingProducts();
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

      // Atualiza o estado local para remover o produto que foi iniciado
      setPendingProducts((prevProducts) =>
        prevProducts.filter((item) => item.product.orderNumber !== orderNumber)
      );

      // Exibe o modal de confirmação com a mensagem
      setModalMessage(`Pedido #${orderNumber} iniciado!`);
      setShowModal(true);

      console.log("Product status updated to 'produção' successfully!");
    } catch (error) {
      console.error("Error updating product status: ", error);
    } finally {
      setIsStartingOrder(null); // Desativa o loading após a ação

      // Esconde o modal de confirmação após 3 segundos
      setTimeout(() => {
        setShowModal(false);
      }, 3000);
    }
  };

  const handleDeleteOrder = async (tableId: string, orderNumber: string) => {
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

      console.log("Produto removido com sucesso!");
    } catch (error) {
      console.error("Erro ao remover o produto: ", error);
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
                      className="border border-CC3333 rounded-md text-CC3333 font-bold text-sm p-2"
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
                      className="text-CC3333 h-5 w-5 cursor-pointer mr-5 sm:mr-0"
                    />
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

      {showModal && <ModalConfirmation message={modalMessage} />}
    </div>
  );
};

export default PendingProducts;
