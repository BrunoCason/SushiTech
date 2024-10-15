import React, { useEffect, useState } from "react";
import { collection, getDocs, doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../Services/firebaseConfig";
import { Table, Product } from "../../Types";

const InProductionProducts: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [inProductionProducts, setInProductionProducts] = useState<{ table: Table; product: Product }[]>([]);

  useEffect(() => {
    const fetchInProductionProducts = async () => {
      try {
        // Fetch all tables
        const tablesCollectionRef = collection(db, "tables");
        const tablesSnapshot = await getDocs(tablesCollectionRef);

        const inProductionProductsList: { table: Table; product: Product }[] = [];

        // For each table, get products with status 'em producao'
        for (const tableDoc of tablesSnapshot.docs) {
          const tableData = tableDoc.data();
          const products = tableData.products || [];
          const table: Table = { id: tableDoc.id, number: tableData.number, products, userId: tableData.userId || ''};

          const productsWithStatusEmProducao = (products as Product[]).filter(
            (product: Product) => product.status === 'em producao'
          );

          for (const product of productsWithStatusEmProducao) {
            inProductionProductsList.push({ table, product });
          }
        }

        setInProductionProducts(inProductionProductsList);
      } catch (error) {
        console.error("Error fetching in production products: ", error);
      }
    };

    fetchInProductionProducts();
  }, []);

  const handleMarkAsReady = async (tableId: string, instanceId: string) => {
    try {
      const tableRef = doc(db, "tables", tableId);
      const tableDoc = await getDoc(tableRef);
      const currentProducts = tableDoc.data()?.products || [];

      // Update the status of the specific product instance
      const updatedProducts = currentProducts.map((product: Product) =>
        product.instanceId === instanceId ? { ...product, status: 'pronto' } : product
      );

      await updateDoc(tableRef, { products: updatedProducts });

      // Update the local state
      setInProductionProducts(inProductionProducts.filter(item => item.product.instanceId !== instanceId));
      console.log("Product status updated to 'pronto' successfully!");
    } catch (error) {
      console.error("Error updating product status: ", error);
    }
  };

  return (
    <div className="">
      <div className="">
        {inProductionProducts.length === 0 ? (
          <p>Sem produtos em produção</p>
        ) : (
          <ul className="space-y-4">
            {inProductionProducts.map((item, index) => (
              <li key={index} className="bg-gray-100 p-4 rounded-lg shadow-md">
                <h4 className="text-xl font-semibold mb-2">Mesa {item.table.number}</h4>
                <p className="text-lg mb-2"><strong>Produto:</strong> {item.product.name}</p>
                <p className="text-lg mb-2"><strong>Preço:</strong> ${item.product.price}</p>
                <p className="text-lg mb-2"><strong>Quantidade:</strong> {item.product.quantity}</p>
                {item.product.image && (
                  <img 
                    src={item.product.image} 
                    alt={item.product.name} 
                    className="w-32 h-32 object-cover mt-2 mb-4 rounded-md" 
                  />
                )}
                <button 
                  onClick={() => handleMarkAsReady(item.table.id, item.product.instanceId!)} // Pass the instanceId
                  className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 mt-2"
                >
                  Marcar como Pronto
                </button>
              </li>
            ))}
          </ul>
        )}
        <button 
          onClick={onClose} 
          className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 mt-4"
        >
          Fechar
        </button>
      </div>
    </div>
  );
};

export default InProductionProducts;
