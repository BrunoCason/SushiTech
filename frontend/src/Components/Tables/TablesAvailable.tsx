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

const TablesAvailable: React.FC = () => {
  const [tableNumber, setTableNumber] = useState<string>("");
  const [tables, setTables] = useState<Table[]>([]);
  const [editTableId, setEditTableId] = useState<string | null>(null);
  const [editTableNumber, setEditTableNumber] = useState<string>("");
  const [isAdmin, setIsAdmin] = useState(false);

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
    <div className="p-6 bg-gray-100 min-h-screen">
      <PageTitle title="Mesas" />
      <h2 className="text-2xl font-semibold mb-4">Adicionar Mesa</h2>
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

      <h2 className="text-2xl font-semibold mb-4">Lista de Mesas</h2>
      <ul>
        {tables.map(table => (
          <li key={table.id} className="mb-4 bg-white p-4 rounded-lg shadow-md">
            <div className="flex justify-between items-center">
              <span className="text-xl font-semibold">Mesa {table.number}</span>
              <div>
                <Link
                  to={`/table/${table.number}`}
                  className="text-blue-500 hover:underline mr-4"
                >
                  Visualizar
                </Link>
                {isAdmin && (
                  <>
                    <button
                      onClick={() => {
                        setEditTableId(table.id);
                        setEditTableNumber(table.number);
                      }}
                      className="text-yellow-500 hover:underline mr-4"
                    >
                      Editar
                    </button>
                    <DeleteButtonTable
                      tableId={table.id}
                      email={`table${table.number}@restaurant.com`}
                      onTableDeleted={fetchTables}
                    />
                  </>
                )}
              </div>
            </div>
            <button
              className={`mt-4 px-4 py-2 rounded-md text-white ${
                table.products && table.products.length > 0
                  ? "bg-red-500 hover:bg-red-600 focus:ring-red-500"
                  : "bg-green-500 hover:bg-green-600 focus:ring-green-500"
              } focus:outline-none focus:ring-2`}
            >
              {table.products && table.products.length > 0 ? "Produtos Adicionados" : "Sem Produtos"}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TablesAvailable;
