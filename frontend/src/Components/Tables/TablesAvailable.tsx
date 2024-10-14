import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { collection, addDoc, getDocs } from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { db } from "../../Services/firebaseConfig";
import { auth } from "../../firebaseAuth";
import PageTitle from "../PageTitle";
import { Table } from "../../Types";
import DeleteButtonTable from "./DeleteButtonTable";
import EditTableForm from "./EditTableForm";
import { getUserRole } from "../../Services/roleService";
import { IoMdAdd } from "react-icons/io";
import { MdEdit } from "react-icons/md";

const TablesAvailable: React.FC = () => {
  const [tableNumber, setTableNumber] = useState<string>("");
  const [tables, setTables] = useState<Table[]>([]);
  const [editTableId, setEditTableId] = useState<string | null>(null);
  const [editTableNumber, setEditTableNumber] = useState<string>("");
  const [isAdmin, setIsAdmin] = useState(false);

  const freeTableImage = "https://firebasestorage.googleapis.com/v0/b/tg-fatec-cfd4a.appspot.com/o/static%2Ftable-black.png?alt=media&token=abe85ef6-5025-40cb-9b1e-596e60a1ec20";
  const occupiedTableImage = "https://firebasestorage.googleapis.com/v0/b/tg-fatec-cfd4a.appspot.com/o/static%2Ftable-white.png?alt=media&token=e0e89cfc-67ef-4223-9376-4a2c74752739";

  const handleAddTable = async () => {
    if (tableNumber) {
      try {
        const email = `table${tableNumber}@restaurant.com`;
        const password = `password${tableNumber}`;
        
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const userId = userCredential.user.uid;

        await addDoc(collection(db, "tables"), {
          number: tableNumber,
          products: [],
          userId: userId,
        });

        setTableNumber("");
        fetchTables();
      } catch (error) {
        console.error("Error adding table: ", error);
      }
    }
  };

  const fetchTables = async () => {
    const querySnapshot = await getDocs(collection(db, "tables"));
    const tablesList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Table[];
    setTables(tablesList);
  };

  useEffect(() => {
    fetchTables();

    const checkUserRole = async () => {
      const user = auth.currentUser;
      if (user) {
        try {
          const role = await getUserRole(user.uid);
          setIsAdmin(role === 'admin');
        } catch (error) {
          console.error("Error fetching user role:", error);
        }
      }
    };

    checkUserRole();
  }, []);

  return (

<div className="mt-20 bg-gray-100 font-inter">
  <PageTitle title="Mesas" />
  <div>
    <button className="flex items-center text-sm p-2 font-bold text-CC3333 border border-CC3333 rounded-md">
      <IoMdAdd className="h-4 w-4 mr-1" />
      Adicionar Mesa
    </button>
    <h2 className="text-center font-semibold text-3xl">Mesas</h2>
  </div>
  <div className="mb-4">
    <input
      type="text"
      placeholder="Número da Mesa"
      value={tableNumber}
      onChange={(e) => setTableNumber(e.target.value)}
      className="border border-gray-300 p-2 rounded-md mr-2"
    />
    <button
      onClick={handleAddTable}
      className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      Adicionar Mesa
    </button>
  </div>

  {editTableId && (
    <EditTableForm
      tableId={editTableId}
      currentNumber={editTableNumber}
      onClose={() => setEditTableId(null)}
      onTableUpdated={fetchTables}
    />
  )}
  
  <div className="flex justify-around">
    <ul className="grid grid-cols-4 gap-24">
      {tables
        .sort((a, b) => Number(a.number) - Number(b.number)) // Converte para número antes de ordenar
        .map(table => (
          <li 
            key={table.id} 
            className={`rounded-lg w-48 h-48 ${
              table.products && table.products.length > 0
                ? "bg-CC3333 text-white"  // Cor quando há produtos
                : "bg-DEDEDE" // Cor quando não há produtos
            }`}
          >
          <div>
            <Link to={`/table/${table.number}`}>
            <div className="text-center p-4">
              <span className="text-base font-bold">Mesa {table.number}</span>
              <img
                src={table.products && table.products.length > 0 ? occupiedTableImage : freeTableImage}
                alt={`Mesa ${table.number} - ${table.products && table.products.length > 0 ? 'Ocupada' : 'Livre'}`}
                className="w-24 h-24 mx-auto mt-2"
              />
                {isAdmin && (
                  <div className="flex justify-end">
                    <MdEdit onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setEditTableId(table.id);
                      setEditTableNumber(table.number);
                    }} className="cursor-pointer w-5 h-5 mr-2" />
                    <DeleteButtonTable
                      tableId={table.id}
                      email={`table${table.number}@restaurant.com`}
                      onTableDeleted={fetchTables}
                    />
                  </div>
                )}
              </div>
              </Link>
            </div>
          </li>
        ))}
    </ul>
  </div>
</div>

  );
};

export default TablesAvailable;
