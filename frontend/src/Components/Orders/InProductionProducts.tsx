import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../Services/firebaseConfig";
import { Table, Product } from "../../Types";

const InProductionProducts = () => {
  const [inProductionProducts, setInProductionProducts] = useState<
    { table: Table; product: Product }[]
  >([]);

  useEffect(() => {
    const fetchInProductionProducts = async () => {
      try {
        // Fetch all tables
        const tablesCollectionRef = collection(db, "tables");
        const tablesSnapshot = await getDocs(tablesCollectionRef);

        const inProductionProductsList: { table: Table; product: Product }[] =
          [];

        // For each table, get products with status 'em producao'
        for (const tableDoc of tablesSnapshot.docs) {
          const tableData = tableDoc.data();
          const products = tableData.products || [];
          const table: Table = {
            id: tableDoc.id,
            number: tableData.number,
            products,
            userId: tableData.userId || "",
          };

          const productsWithStatusEmProducao = (products as Product[]).filter(
            (product: Product) => product.status === "produção"
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

  const handleMarkAsReady = async (tableId: string, productId: string) => {
    try {
      const tableRef = doc(db, "tables", tableId);
      const tableDoc = await getDoc(tableRef);
      const currentProducts = tableDoc.data()?.products || [];
  
      // Update the status of the specific product using productId
      const updatedProducts = currentProducts.map((product: Product) =>
        product.id === productId // Usar product.id em vez de instanceId
          ? { ...product, status: "pronto" }
          : product
      );
  
      await updateDoc(tableRef, { products: updatedProducts });
  
      // Update the local state to remove the product that was just marked as ready
      setInProductionProducts((prevProducts) =>
        prevProducts.filter((item) => item.product.id !== productId)
      );
  
      console.log("Product status updated to 'pronto' successfully!");
    } catch (error) {
      console.error("Error updating product status: ", error);
    }
  };  

  return (
    <div className="font-inter flex justify-center">
      <div className="">
        {inProductionProducts.length === 0 ? (
          <p className="font-bold text-E6E6E text-4xl mt-20">
            Sem produtos em preparação
          </p>
        ) : (
          <div className="font-inter grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6 mt-14">
            {inProductionProducts.map((item, index) => (
              <div
                key={index}
                className="flex justify-between border w-432px h-156px border-A7A7A7 rounded-md shadow-md p-3"
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
                        handleMarkAsReady(item.table.id, item.product.id)
                      }
                      className="border border-CC3333 rounded-md text-CC3333 font-bold text-sm px-5 py-2"
                    >
                      Concluir
                    </button>
                  </div>
                </div>
                <div>
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-40 h-32 object-cover rounded-md"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default InProductionProducts;
