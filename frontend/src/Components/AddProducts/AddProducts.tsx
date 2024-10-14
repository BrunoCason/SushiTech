import React, { useState, useEffect } from "react";
import { collection, addDoc, getDocs } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../../Services/firebaseConfig";
import PageTitle from "../PageTitle";
import DeleteProductButton from "./DeleteProductButton";
import EditProductForm from "./EditProductForm";

const tagsOptions = [
  "Temaki",
  "Frito",
  "Bebida",
  "Sashimi",
  "Nigiri",
  "Sushi",
  "Maki",
  "Donburi",
  "Uramaki",
  "Yakimeshi",
  "Katsu",
];

const AddProducts: React.FC = () => {
  const [productName, setProductName] = useState<string>("");
  const [productPrice, setProductPrice] = useState<number>(0);
  const [productQuantity, setProductQuantity] = useState<number>(0);
  const [productImage, setProductImage] = useState<File | null>(null);
  const [productTags, setProductTags] = useState<string[]>([]);
  const [products, setProducts] = useState<{ id: string, name: string, price: number, quantity: number, image: string, tags: string[] }[]>([]);
  const [editProductId, setEditProductId] = useState<string | null>(null);
  const [editProductName, setEditProductName] = useState<string>("");
  const [editProductPrice, setEditProductPrice] = useState<number>(0);
  const [editProductQuantity, setEditProductQuantity] = useState<number>(0);
  const [editProductTags, setEditProductTags] = useState<string[]>([]);
  const [showTagsMenu, setShowTagsMenu] = useState(false);

  const handleAddProduct = async () => {
    if (productName && productPrice > 0 && productQuantity > 0 && productImage) {
      try {
        const imageRef = ref(storage, `products/${productImage.name}`);
        const snapshot = await uploadBytes(imageRef, productImage);
        const imageUrl = await getDownloadURL(snapshot.ref);

        await addDoc(collection(db, "products"), {
          name: productName,
          price: productPrice,
          quantity: productQuantity,
          image: imageUrl,
          tags: productTags,
        });
        console.log("Product added successfully!");
        setProductName("");
        setProductPrice(0);
        setProductQuantity(0);
        setProductImage(null);
        setProductTags([]);
        fetchProducts();
      } catch (error) {
        console.error("Error adding product: ", error);
      }
    } else {
      console.log("Please enter product name, price, quantity, and upload an image.");
    }
  };

  const fetchProducts = async () => {
    const querySnapshot = await getDocs(collection(db, "products"));
    const productsList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as { id: string, name: string, price: number, quantity: number, image: string, tags: string[] }[];
    setProducts(productsList);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleTagSelect = (tag: string) => {
    setProductTags(prevTags =>
      prevTags.includes(tag) ? prevTags.filter(t => t !== tag) : [...prevTags, tag]
    );
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <PageTitle title="Produtos" />
      <h2 className="text-2xl font-semibold mb-4">Adicionar Produto</h2>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Nome"
          value={productName}
          onChange={(e) => setProductName(e.target.value)}
          className="border border-gray-300 p-2 rounded-md mr-2"
        />
        <input
          type="number"
          placeholder="Preço"
          value={productPrice}
          onChange={(e) => setProductPrice(Number(e.target.value))}
          className="border border-gray-300 p-2 rounded-md mr-2"
        />
        <input
          type="number"
          placeholder="Quantidade"
          value={productQuantity}
          onChange={(e) => setProductQuantity(Number(e.target.value))}
          className="border border-gray-300 p-2 rounded-md mr-2"
        />
        <input
          type="file"
          onChange={(e) => setProductImage(e.target.files ? e.target.files[0] : null)}
          className="border border-gray-300 p-2 rounded-md mr-2"
        />
        <div className="relative">
          <button
            onClick={() => setShowTagsMenu(!showTagsMenu)}
            className="border border-gray-300 p-2 rounded-md mr-2"
          >
            {productTags.length ? productTags.join(", ") : "Selecionar Tags"}
          </button>
          {showTagsMenu && (
            <div className="absolute z-10 bg-white border border-gray-300 rounded-lg shadow-lg mt-1 w-48">
              {tagsOptions.map(tag => (
                <button
                  key={tag}
                  onClick={() => handleTagSelect(tag)}
                  className={`block px-4 py-2 text-left hover:bg-gray-200 w-full ${productTags.includes(tag) ? 'bg-gray-100' : ''}`}
                >
                  {tag}
                </button>
              ))}
            </div>
          )}
        </div>
        <button
          onClick={handleAddProduct}
          className="bg-blue-500 text-white px-4 py-2 rounded-md"
        >
          Adicionar
        </button>
      </div>
      <h2 className="text-2xl font-semibold mb-4">Produtos Cadastrados</h2>
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="py-2">Nome</th>
            <th className="py-2">Preço</th>
            <th className="py-2">Quantidade</th>
            <th className="py-2">Imagem</th>
            <th className="py-2">Tags</th>
            <th className="py-2">Ações</th>
          </tr>
        </thead>
        <tbody>
          {products.map(product => (
            <tr key={product.id} className="text-center">
              <td className="py-2">{product.name}</td>
              <td className="py-2">{product.price}</td>
              <td className="py-2">{product.quantity}</td>
              <td className="py-2">
                <img src={product.image} alt={product.name} className="w-16 h-16 object-cover mx-auto" />
              </td>
              <td className="py-2">{product.tags.join(", ")}</td>
              <td className="py-2">
                <button
                  onClick={() => {
                    setEditProductId(product.id);
                    setEditProductName(product.name);
                    setEditProductPrice(product.price);
                    setEditProductQuantity(product.quantity);
                    setEditProductTags(product.tags);
                  }}
                  className="text-blue-500 hover:underline"
                >
                  Editar
                </button>
                <DeleteProductButton
                  productId={product.id}
                  productImageUrl={product.image}
                  onProductDeleted={fetchProducts}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {editProductId && (
        <EditProductForm
          productId={editProductId}
          productName={editProductName}
          productPrice={editProductPrice}
          productQuantity={editProductQuantity}
          productTags={editProductTags}
          onUpdate={() => {
            setEditProductId(null);
            setEditProductName("");
            setEditProductPrice(0);
            setEditProductQuantity(0);
            setEditProductTags([]);
            fetchProducts();
          }}
          onCancel={() => {
            setEditProductId(null);
            setEditProductName("");
            setEditProductPrice(0);
            setEditProductQuantity(0);
            setEditProductTags([]);
          }}
        />
      )}
    </div>
  );
};

export default AddProducts;
