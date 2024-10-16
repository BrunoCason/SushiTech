import { useEffect, useState } from "react";
import { collection, getDocs, doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../Services/firebaseConfig";
import PageTitle from "../PageTitle";
import { Table, Product } from "../../Types";
import { RiDeleteBin6Fill } from "react-icons/ri";

const PendingProducts = () => {
  const [pendingProducts, setPendingProducts] = useState<
    { table: Table; product: Product }[]
  >([]);

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
      }
    };

    fetchPendingProducts();
  }, []);

  const handleStartOrder = async (tableId: string, productId: string) => {
    try {
      const tableRef = doc(db, "tables", tableId);
      const tableDoc = await getDoc(tableRef);
      const currentProducts = tableDoc.data()?.products || [];

      // Update the status of the specific product using productId
      const updatedProducts = currentProducts.map((product: Product) =>
        product.id === productId // Use product.id instead of instanceId
          ? { ...product, status: "produção" }
          : product
      );

      await updateDoc(tableRef, { products: updatedProducts });

      // Update the local state to remove the product that was just started
      setPendingProducts((prevProducts) =>
        prevProducts.filter((item) => item.product.id !== productId)
      );

      console.log("Product status updated to 'produção' successfully!");
    } catch (error) {
      console.error("Error updating product status: ", error);
    }
  };

  const handleDeleteOrder = async (tableId: string, productId: string) => {
    try {
      const tableRef = doc(db, "tables", tableId);
      const tableDoc = await getDoc(tableRef);
      const currentProducts = tableDoc.data()?.products || [];

      // Filtra os produtos, removendo o produto que tem o id igual ao productId
      const updatedProducts = currentProducts.filter(
        (product: Product) => product.id !== productId
      );

      // Atualiza a lista de produtos no Firestore
      await updateDoc(tableRef, { products: updatedProducts });

      // Atualiza o estado local para remover o produto da lista pendente
      setPendingProducts((prevProducts) =>
        prevProducts.filter((item) => item.product.id !== productId)
      );

      console.log("Produto removido com sucesso!");
    } catch (error) {
      console.error("Erro ao remover o produto: ", error);
    }
  };

  return (
    <div className="font-inter flex justify-center">
      <PageTitle title="Pedidos Realizados" />
      {pendingProducts.length === 0 ? (
        <p className="font-bold text-E6E6E text-4xl mt-20">Sem produtos pendentes</p>
      ) : (
        <div className="font-inter grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6 mt-14">
          {pendingProducts.map((item, index) => (
            <div
              key={index}
              className="flex justify-between border w-432px h-156px border-A7A7A7 rounded-md shadow-md p-3"
            >
              <div className="w-56">
                <p className="font-bold text-lg mb-1">Mesa {item.table.number} - {item.product.name}</p>
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
                      handleStartOrder(item.table.id, item.product.id)
                    }
                    className="border border-CC3333 rounded-md text-CC3333 font-bold text-sm p-2"
                  >
                    Iniciar Pedido
                  </button>
                  <RiDeleteBin6Fill
                    onClick={() => handleDeleteOrder(item.table.id, item.product.id)}
                    className="text-CC3333 h-5 w-5 cursor-pointer"
                  />
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
  );
};

export default PendingProducts;
