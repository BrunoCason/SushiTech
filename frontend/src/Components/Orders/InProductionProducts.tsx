import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../Services/firebaseConfig";
import { Table, Product } from "../../Types";
import { FaSpinner } from "react-icons/fa";
import ModalConfirmation from "../ModalConfirmation";
import PageTitle from "../PageTitle";

const InProductionProducts = () => {
  const [inProductionProducts, setInProductionProducts] = useState<
    { table: Table; product: Product }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [isStartingOrder, setIsStartingOrder] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  useEffect(() => {
    const fetchInProductionProducts = () => {
      const tablesCollectionRef = collection(db, "tables");

      // Usamos onSnapshot para escutar mudanças em tempo real
      const unsubscribe = onSnapshot(tablesCollectionRef, (snapshot) => {
        const inProductionProductsList: { table: Table; product: Product }[] =
          [];

        snapshot.docs.forEach((tableDoc) => {
          const tableData = tableDoc.data();
          const products = tableData.products || [];
          const table: Table = {
            id: tableDoc.id,
            number: tableData.number,
            products,
            userId: tableData.userId || "",
            status: "",
          };

          const productsWithStatusEmProducao = (products as Product[]).filter(
            (product: Product) => product.status === "produção"
          );

          for (const product of productsWithStatusEmProducao) {
            inProductionProductsList.push({ table, product });
          }
        });

        setInProductionProducts(inProductionProductsList);
        setLoading(false); // Desativa o loading após o carregamento dos dados
      });

      // Limpa o listener ao desmontar o componente
      return () => unsubscribe();
    };

    fetchInProductionProducts();
  }, []);

  const handleMarkAsReady = async (tableId: string, orderNumber: string) => {
    setIsStartingOrder(orderNumber);
    try {
      const tableRef = doc(db, "tables", tableId);
      const tableDoc = await getDoc(tableRef);
      const currentProducts = tableDoc.data()?.products || [];

      // Atualiza o status do produto específico para 'pronto'
      const updatedProducts = currentProducts.map((product: Product) =>
        product.orderNumber === orderNumber
          ? { ...product, status: "pronto" }
          : product
      );

      await updateDoc(tableRef, { products: updatedProducts });

      // Remove o produto marcado como pronto do estado local
      setInProductionProducts((prevProducts) =>
        prevProducts.filter((item) => item.product.orderNumber !== orderNumber)
      );
      setModalMessage(`Pedido #${orderNumber} pronto!`);
      setShowModal(true);

      console.log("Product status updated to 'pronto' successfully!");
    } catch (error) {
      console.error("Error updating product status: ", error);
    } finally {
      setIsStartingOrder(null);

      setTimeout(() => {
        setShowModal(false);
      }, 3000);
    }
  };

  return (
    <div className="font-inter flex justify-center container mx-auto">
      <PageTitle title="Pedidos em Preparação" />
      <div className="mb-5">
        {loading ? (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <FaSpinner className="animate-spin text-CC3333 h-8 w-8" />
          </div>
        ) : inProductionProducts.length === 0 ? (
          <p className="font-bold text-E6E6E text-xl md:text-4xl mt-20">
            Sem produtos em preparação
          </p>
        ) : (
          <div className="flex justify-center">
            <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-y-5 gap-x-8 mt-14">
              {inProductionProducts.map((item, index) => (
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
                          handleMarkAsReady(
                            item.table.id,
                            item.product.orderNumber
                          )
                        }
                        className="border border-CC3333 rounded-md text-CC3333 font-bold text-sm px-5 py-2 hover:bg-CC3333 hover:font-bold hover:text-white hover:transition-transform duration-300"
                      >
                        {isStartingOrder === item.product.orderNumber ? (
                          <FaSpinner className="animate-spin h-5 w-5" />
                        ) : (
                          "Concluir"
                        )}
                      </button>
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
      </div>
      {showModal && <ModalConfirmation message={modalMessage} />}
    </div>
  );
};

export default InProductionProducts;
