// src/pages/MyOrders.tsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { collection, getDocs, query, where, DocumentData } from "firebase/firestore";
import { db } from "../../Services/firebaseConfig";
import PageTitle from "../PageTitle";

const MyOrders: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [orders, setOrders] = useState<DocumentData[]>([]);

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
            setOrders(tableData.products);  // Aqui estamos pegando os pedidos realizados
          }
        }
      } catch (error) {
        console.error("Error fetching orders: ", error);
      }
    };

    fetchOrders();
  }, [id]);

  return (
    <div className="p-6 font-inter container mx-auto">
      <PageTitle title={`Meus Pedidos - Mesa ${id}`} />
      {orders.length > 0 ? (
        <ul className="space-y-4">
          {orders.map((order, index) => (
            <li
              key={index}
              className="flex justify-between items-center bg-gray-100 p-4 rounded-lg"
            >
              <div>
                <h3 className="text-lg font-semibold">{order.name}</h3>
                <p>Quantidade: {order.quantity}</p>
                <p>Status: {order.status}</p>
              </div>
              <img
                src={order.image}
                alt={order.name}
                className="w-16 h-16 object-cover rounded-md"
              />
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500">Nenhum pedido realizado.</p>
      )}
    </div>
  );
};

export default MyOrders;
