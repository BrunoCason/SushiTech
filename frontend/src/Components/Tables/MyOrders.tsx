import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  collection,
  getDocs,
  query,
  where,
  DocumentData,
  updateDoc,
  doc,
} from "firebase/firestore";
import { db } from "../../Services/firebaseConfig";
import PageTitle from "../PageTitle";
import { RiDeleteBin6Fill } from "react-icons/ri";
import { FaSpinner } from "react-icons/fa";
import ModalConfirmation from "../ModalConfirmation";

const MyOrders = () => {
  const { id } = useParams<{ id: string }>();
  const [orders, setOrders] = useState<DocumentData[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirmationMessage, setConfirmationMessage] = useState<string | null>(
    null
  );

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const tablesCollectionRef = collection(db, "tables");
        const q = query(tablesCollectionRef, where("number", "==", id));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const tableDoc = querySnapshot.docs[0];
          const tableData = tableDoc.data();

          if (tableData && tableData.products) {
            setOrders(tableData.products);
          }
        }
      } catch (error) {
        console.error("Error fetching orders: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [id]);

  const handleCancelOrder = (index: number) => {
    setOrderToCancel(index);
    setShowModal(true);
  };

  const confirmCancelOrder = async () => {
    if (orderToCancel !== null) {
      setLoading(true);

      try {
        const updatedOrders = orders.filter((_, i) => i !== orderToCancel);
        setOrders(updatedOrders);

        const tablesCollectionRef = collection(db, "tables");
        const q = query(tablesCollectionRef, where("number", "==", id));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const tableDoc = querySnapshot.docs[0];
          const tableDocRef = doc(db, "tables", tableDoc.id);
          await updateDoc(tableDocRef, { products: updatedOrders });
        }

        setLoading(false);

        setShowModal(false);
        setConfirmationMessage("Pedido cancelado com sucesso!");

        // Fecha o modal de confirmação após 3 segundos
        setTimeout(() => {
          setConfirmationMessage(null);
        }, 3000);
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    } else {
      setShowModal(false);
    }
  };

  const cancelCancelOrder = () => {
    setShowModal(false);
  };

  const totalPrice = orders.reduce(
    (acc, order) => acc + order.price * order.quantity,
    0
  );

  const formatPrice = (priceInCents: number) => {
    const priceInReais = (priceInCents / 100).toFixed(2);
    return priceInReais.replace(".", ",");
  };

  return (
    <div className="p-6 font-inter container mx-auto min-h-screen">
      <PageTitle title={`Meus Pedidos - Mesa ${id}`} />
      <div className="flex mb-10">
        <p>LOGO</p>
        <p className="font-semibold text-3xl">Meus Pedidos</p>
      </div>
      <Link to={`/table/${id}`}>
        <button className="border-2 border-CC3333 rounded-md font-bold text-sm py-1 px-5 mb-10">
          Retornar
        </button>
      </Link>
      <div className="flex items-center flex-col lg:flex-row lg:items-start">
        <div className="lg:w-9/12 lg:mr-8">
          <div className="bg-CC3333 text-xs sm:text-base text-white font-medium py-4 mb-10 rounded-md">
            <div className="grid grid-cols-5 text-center lg:ml-24 lg:mr-5">
              <p>Item</p>
              <p>Preço</p>
              <p>Quantidade</p>
              <p>Sub Total</p>
              <p>Status</p>
            </div>
          </div>
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <FaSpinner className="animate-spin text-CC3333 h-8 w-8" />
            </div>
          ) : orders.length > 0 ? (
            <ul className="space-y-4">
              {orders.map((order, index) => (
                <li key={index} className="flex items-center rounded-lg">
                  <img
                    src={order.image}
                    alt={order.name}
                    className="w-24 h-20 object-cover rounded-md hidden lg:block"
                  />
                  <div className="grid grid-cols-5 text-xs sm:text-base text-center w-full text-E6E6E">
                    <p>{order.name}</p>
                    <p>{formatPrice(order.price)}</p>
                    <p>{order.quantity}</p>
                    <p>{formatPrice(order.price * order.quantity)}</p>
                    <p>{order.status}</p>
                  </div>
                  <div className="flex justify-center items-center -mr-10 lg:-mr-0">
                    {order.status === "pendente" ? (
                      <RiDeleteBin6Fill
                        className="cursor-pointer text-CC3333 h-5 w-5"
                        onClick={() => handleCancelOrder(index)}
                      />
                    ) : (
                      <div className="h-5 w-5" />
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-E6E6E font-bold text-2xl text-center">
              Nenhum pedido foi realizado
            </p>
          )}
        </div>

        <div className="bg-CC3333 rounded-md mt-10 lg:mt-0 text-white py-4 px-6 w-72 h-full flex flex-col justify-between">
          <div>
            <p className="font-medium text-xl sm:text-3xl text-center mb-5">
              Total
            </p>
            <div className="font-medium text-base flex justify-between mb-11">
              <p className="text-sm sm:text-base">Sub Total</p>
              {orders.length > 0 ? (
                <ul className="space-y-1 text-sm sm:text-base">
                  {orders.map((order, index) => (
                    <li key={index}>
                      <p>{formatPrice(order.price * order.quantity)}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>0.00</p>
              )}
            </div>
          </div>
          <div className="flex justify-between items-center">
            <p className="font-medium text-base">Total</p>
            <p className="font-bold text-xl">{formatPrice(totalPrice)}</p>
          </div>
          <div className="flex justify-center mt-4 mb-2">
            <button className="rounded-md bg-white text-black font-semibold text-sm py-2 px-5">
              Fechar Conta
            </button>
          </div>
        </div>
      </div>

      {/* Modal de Confirmação */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white mx-10 pt-10 pb-7 px-4 rounded-lg shadow-lg w-510px text-center font-inter font-bold text-base">
            <div className="flex justify-center mb-8">
              <p className="flex justify-center items-center border-4 border-FACEA8 rounded-full h-20 w-20 text-FACEA8 font-normal text-5xl">
                !
              </p>
            </div>
            <h3 className="text-2xl">Atenção</h3>
            <p className="font-normal text-xl my-4">
              Tem certeza de que deseja cancelar esse pedido?
            </p>
            <div className="mt-4 flex justify-center">
              <button
                onClick={cancelCancelOrder}
                className="bg-ADABAC text-white py-2 px-6 mr-16 rounded"
              >
                Cancelar
              </button>
              <button
                onClick={confirmCancelOrder}
                className="bg-CC3333 text-white py-2 px-6 rounded"
                disabled={loading}
              >
                Confirmar
                {loading && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <FaSpinner className="animate-spin text-CC3333 h-7 w-7" />
                  </div>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Sucesso */}
      {confirmationMessage && (
        <ModalConfirmation message={confirmationMessage} />
      )}
    </div>
  );
};

export default MyOrders;
