import React, { useEffect, useState } from "react";
import { collection, getDocs, doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../Services/firebaseConfig";
import PageTitle from "../PageTitle";
import { Table, Product } from "../../Types";

const PendingProducts: React.FC = () => {
  const [pendingProducts, setPendingProducts] = useState<{ table: Table; product: Product }[]>([]);

  useEffect(() => {
    const fetchPendingProducts = async () => {
      try {
        // Fetch all tables
        const tablesCollectionRef = collection(db, "tables");
        const tablesSnapshot = await getDocs(tablesCollectionRef);

        const pendingProductsList: { table: Table; product: Product }[] = [];

        // For each table, get products with status 'pendente'
        for (const tableDoc of tablesSnapshot.docs) {
          const tableData = tableDoc.data();
          const table: Table = { 
            id: tableDoc.id, 
            number: tableData.number, 
            products: tableData.products || [],
            userId: tableData.userId || ''
          };

          const productsWithStatusPendente = (table.products as Product[]).filter(
            (product: Product) => product.status === 'pendente'
          );

          for (const product of productsWithStatusPendente) {
            pendingProductsList.push({ table, product });
          }
        }

        setPendingProducts(pendingProductsList);
      } catch (error) {
        console.error("Error fetching pending products: ", error);
      }
    };

    fetchPendingProducts();
  }, []);

  const handleStartOrder = async (tableId: string, instanceId: string) => {
    try {
      const tableRef = doc(db, "tables", tableId);
      const tableDoc = await getDoc(tableRef);
      const currentProducts = tableDoc.data()?.products || [];

      // Update the status of the specific product using instanceId
      const updatedProducts = currentProducts.map((product: Product) =>
        product.instanceId === instanceId ? { ...product, status: 'em producao' } : product
      );

      await updateDoc(tableRef, { products: updatedProducts });

      // Update the local state to remove the product that was just started
      setPendingProducts(prevProducts => 
        prevProducts.filter(item => item.product.instanceId !== instanceId)
      );
      
      console.log("Product status updated to 'em producao' successfully!");
    } catch (error) {
      console.error("Error updating product status: ", error);
    }
  };

  return (
    <div className="font-inter">
      <PageTitle title="Pedidos" />
      {pendingProducts.length === 0 ? (
        <p>Sem produtos pendentes encontrados.</p>
      ) : (
        <ul className="space-y-4">
          {pendingProducts.map((item, index) => (
            <li key={index} className="bg-white p-4 rounded-lg shadow-md">
              <p className="font-bold text-lg">Mesa {item.table.number} - <span className="text-E6E6E">{item.product.name} {item.product.quantity} uni</span></p>
              <p className="text-E6E6E text-sm font-medium">Quantidade: {item.product.quantity}</p>
              <p className="text-E6E6E text-sm font-medium">Pedido #{item.product.price}</p>
              {item.product.image && (
                <img 
                  src={item.product.image} 
                  alt={item.product.name} 
                  className="w-32 h-32 object-cover mt-2 mb-4 rounded-md" 
                />
              )}
              <button 
                onClick={() => handleStartOrder(item.table.id, item.product.instanceId!)} 
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Iniciar
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default PendingProducts;
