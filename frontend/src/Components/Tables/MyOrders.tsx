import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { collection, getDocs, query, where, DocumentData, updateDoc, doc } from "firebase/firestore";
import { db } from "../../Services/firebaseConfig";
import PageTitle from "../PageTitle";
import { RiDeleteBin6Fill } from "react-icons/ri";

const MyOrders: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [orders, setOrders] = useState<DocumentData[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState<number | null>(null);

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
      }
    };

    fetchOrders();
  }, [id]);

  // Função para cancelar o pedido
  const handleCancelOrder = (index: number) => {
    setOrderToCancel(index); // Armazena o índice do pedido que será cancelado
    setShowModal(true);
  };

  const confirmCancelOrder = async () => {
    if (orderToCancel !== null) {
      try {
        const updatedOrders = orders.filter((_, i) => i !== orderToCancel); // Remove o pedido pelo índice
        setOrders(updatedOrders);

        // Atualiza o Firestore com a nova lista de pedidos
        const tablesCollectionRef = collection(db, "tables");
        const q = query(tablesCollectionRef, where("number", "==", id));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const tableDoc = querySnapshot.docs[0];
          const tableDocRef = doc(db, "tables", tableDoc.id);

          // Atualizando os produtos (pedidos) no Firestore
          await updateDoc(tableDocRef, { products: updatedOrders });
        }
      } catch (error) {
        console.error("Error cancelling order: ", error);
      }
    }
    setShowModal(false);
  };

  const cancelCancelOrder = () => {
    setShowModal(false);
  };

  // Calcula o total dos pedidos
  const totalPrice = orders.reduce(
    (acc, order) => acc + order.price * order.quantity,
    0
  );

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
      <div className="flex">
        <div className="w-9/12 mr-8">
          <div className="bg-CC3333 text-base text-white font-medium py-4 mb-10 rounded-md">
            <div className="grid grid-cols-5 text-center ml-24 mr-5">
              <p>Item</p>
              <p>Preço</p>
              <p>Quantidade</p>
              <p>Sub Total</p>
              <p>Status</p>
            </div>
          </div>
          {orders.length > 0 ? (
            <ul className="space-y-4">
              {orders.map((order, index) => (
                <li key={index} className="flex items-center rounded-lg">
                  <img
                    src={order.image}
                    alt={order.name}
                    className="w-24 h-20 object-cover rounded-md"
                  />
                  <div className="grid grid-cols-5 text-center w-full text-E6E6E">
                    <p>{order.name}</p>
                    <p>{order.price}</p>
                    <p>{order.quantity}</p>
                    <p>{(order.price * order.quantity).toFixed(2)}</p>
                    <p>{order.status}</p>
                  </div>
                  <div className="flex justify-center items-center">
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

        <div className="bg-CC3333 rounded-md text-white py-4 px-6 w-72 h-full flex flex-col justify-between">
          <div>
            <p className="font-medium text-3xl text-center mb-5">Total</p>
            <div className="font-medium text-base flex justify-between mb-11">
              <p>Sub Total</p>
              {orders.length > 0 ? (
                <ul className="space-y-1">
                  {orders.map((order, index) => (
                    <li key={index}>
                      <p>{(order.price * order.quantity).toFixed(2)}</p>
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
            <p className="font-bold text-xl">{totalPrice.toFixed(2)}</p>
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
              Tem certeza de que deseja excluir esse usuário?
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
                className="bg-CC3333 text-white py-2 px-6 rounded hover:bg-red-600"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyOrders;
