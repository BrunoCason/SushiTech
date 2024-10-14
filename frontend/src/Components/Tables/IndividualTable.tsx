import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { collection, getDocs, query, where, doc, updateDoc, getDoc, DocumentData } from "firebase/firestore";
import { db } from "../../Services/firebaseConfig";
import PageTitle from "../PageTitle";

const IndividualTable: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tableExists, setTableExists] = useState<boolean>(false);
  const [products, setProducts] = useState<DocumentData[]>([]);
  const [tableProducts, setTableProducts] = useState<DocumentData[]>([]);
  const [tableDocId, setTableDocId] = useState<string>("");

  useEffect(() => {
    const checkTableExists = async () => {
      try {
        const tablesCollectionRef = collection(db, "tables");
        const q = query(tablesCollectionRef, where("number", "==", id));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          navigate("/error");
          return;
        }

        const tableDoc = querySnapshot.docs[0];
        setTableDocId(tableDoc.id);
        setTableExists(true);

        const tableData = tableDoc.data();
        if (tableData && tableData.products) {
          setTableProducts(tableData.products);
        }
      } catch (error) {
        console.error("Error checking table existence: ", error);
      }
    };

    const fetchProducts = async () => {
      try {
        const productsCollectionRef = collection(db, "products");
        const querySnapshot = await getDocs(productsCollectionRef);
        const productsList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setProducts(productsList);
      } catch (error) {
        console.error("Error fetching products: ", error);
      }
    };

    checkTableExists();
    fetchProducts();
  }, [id, navigate]);

  const handleAddToCart = async (product: DocumentData) => {
    if (!tableDocId) return;

    try {
      const tableRef = doc(db, "tables", tableDocId);
      const tableDoc = await getDoc(tableRef);
      const currentProducts = tableDoc.data()?.products || [];

      const instanceId = `${product.id}-${Date.now()}`;
      const productWithStatus = { ...product, status: 'pendente', instanceId };
      const updatedProducts = [...currentProducts, productWithStatus];

      await updateDoc(tableRef, { products: updatedProducts });
      setTableProducts(updatedProducts);
      console.log("Product added to table successfully!");
    } catch (error) {
      console.error("Error adding product to table: ", error);
    }
  };

  const handleRemoveFromCart = async (product: DocumentData) => {
    if (!tableDocId) return;

    try {
      const tableRef = doc(db, "tables", tableDocId);
      const tableDoc = await getDoc(tableRef);
      const currentProducts = tableDoc.data()?.products || [];

      const updatedProducts = currentProducts.filter((p: DocumentData) => {
        if (p.instanceId === product.instanceId) {
          if (p.status === 'pendente' || p.status === 'em producao') {
            return false;
          }
          return true;
        }
        return true;
      });

      if (updatedProducts.length < currentProducts.length) {
        await updateDoc(tableRef, { products: updatedProducts });
        setTableProducts(updatedProducts);
        console.log("Product removed from table successfully!");
      } else {
        console.log("Cannot remove product with status 'pronto'.");
      }
    } catch (error) {
      console.error("Error removing product from table: ", error);
    }
  };

  if (!tableExists) {
    return <div className="text-center text-xl mt-10">Loading...</div>;
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <PageTitle title={`Mesa ${id}`} />
      <h2 className="text-2xl font-semibold mb-4">Mesa {id}</h2>
      <ul className="space-y-4 mb-6">
        {products.map((product, index) => (
          <li key={index} className="bg-white p-4 rounded-lg shadow-md flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">{product.name}</h3>
              <p>Price: ${product.price}</p>
              <p>Quantity: {product.quantity}</p>
              {product.image && (
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-24 h-24 object-cover rounded-md mt-2"
                />
              )}
            </div>
            <button
              onClick={() => handleAddToCart(product)}
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Adicionar ao Carrinho
            </button>
          </li>
        ))}
      </ul>
      <h2 className="text-2xl font-semibold mb-4">Produtos no carrinho</h2>
      <ul className="space-y-4">
        {tableProducts.map((product, index) => (
          <li key={index} className="bg-white p-4 rounded-lg shadow-md flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">{product.name}</h3>
              {product.status === 'pendente' || product.status === 'em producao' ? (
                <button
                  onClick={() => handleRemoveFromCart(product)}
                  className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  Cancelar pedido
                </button>
              ) : (
                <p className="text-green-500">Pronto</p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default IndividualTable;
