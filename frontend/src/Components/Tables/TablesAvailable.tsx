import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { collection, addDoc, getDocs } from "firebase/firestore";
import { db } from "../../Services/firebaseConfig";
import { auth } from "../../firebaseAuth";
import PageTitle from "../PageTitle";
import { Table } from "../../Types";
import DeleteButtonTable from "./DeleteButtonTable";
import EditTableForm from "./EditTableForm";
import { getUserRole } from "../../Services/roleService";
import { IoMdAdd } from "react-icons/io";
import { MdEdit } from "react-icons/md";
import AddTableModal from "./AddTableModal";
import { FaSpinner } from "react-icons/fa";
import ModalConfirmation from "../ModalConfirmation";

const TablesAvailable = () => {
  const [tables, setTables] = useState<Table[]>([]);
  const [editTableId, setEditTableId] = useState<string | null>(null);
  const [editTableNumber, setEditTableNumber] = useState<string>("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState("");

  const freeTableImage =
    "https://firebasestorage.googleapis.com/v0/b/tg-fatec-cfd4a.appspot.com/o/static%2Ftable-black.png?alt=media&token=abe85ef6-5025-40cb-9b1e-596e60a1ec20";
  const occupiedTableImage =
    "https://firebasestorage.googleapis.com/v0/b/tg-fatec-cfd4a.appspot.com/o/static%2Ftable-white.png?alt=media&token=e0e89cfc-67ef-4223-9376-4a2c74752739";

  const handleAddTable = async (tableNumber: string) => {
    if (tableNumber) {
      try {
        // Verifica se a mesa já existe
        const existingTables = await getDocs(collection(db, "tables"));
        const tableExists = existingTables.docs.some(
          (doc) => doc.data().number === tableNumber
        );

        if (tableExists) {
          alert(`A mesa número ${tableNumber} já existe!`);
          return; // Para a execução se a mesa já existir
        }

        // Faz uma requisição ao backend para criar o usuário da mesa
        const response = await fetch(
          "http://localhost:3000/api/users/create-table-user",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ tableNumber }),
          }
        );

        if (!response.ok) {
          throw new Error("Erro ao criar o usuário da mesa");
        }

        const { userId } = await response.json(); // Obtém o userId retornado pelo backend

        // Adiciona a mesa ao Firestore com o userId retornado
        await addDoc(collection(db, "tables"), {
          number: tableNumber,
          products: [],
          userId: userId,
        });

        // Atualiza a lista de mesas
        fetchTables();
      } catch (error) {
        console.error(error);
      }
    }
  };

  const fetchTables = async () => {
    const querySnapshot = await getDocs(collection(db, "tables"));
    const tablesList = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Table[];
    setTables(tablesList);
  };

  useEffect(() => {
    fetchTables();

    const checkUserRole = async () => {
      const user = auth.currentUser;
      if (user) {
        try {
          const role = await getUserRole(user.uid);
          setIsAdmin(role === "admin");
        } catch (error) {
          console.error("Error fetching user role:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    checkUserRole();
  }, []);

  const handleTableDeleted = (message: string) => {
    setConfirmationMessage(message);
    setShowConfirmation(true);

    setTimeout(() => {
      setShowConfirmation(false);
    }, 3000);
  };

  return (
    <div className="mt-20 container mx-auto font-inter">
      <PageTitle title="Mesas" />
      <div className="flex items-center flex-col sm:flex-row sm:justify-between">
        <button
          className="flex justify-center items-center text-sm w-40 mb-7 sm:mb-0 p-2 font-bold text-CC3333 border border-CC3333 rounded-md sm:ml-120px md:ml-11 xl:ml-44 2xl:ml-60"
          onClick={() => setIsModalOpen(true)}
        >
          <IoMdAdd className="h-4 w-4 mr-1" />
          Adicionar Mesa
        </button>
        <h2 className="text-center font-semibold text-3xl sm:flex-1 sm:mr-64 md:ml-10 lg:mr-60 xl:-ml-24 2xl:-ml-40">
          Mesas
        </h2>
      </div>

      {isModalOpen && (
        <AddTableModal
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleAddTable}
        />
      )}

      <div className="mb-7">
        {editTableId && (
          <EditTableForm
            tableId={editTableId}
            currentNumber={editTableNumber}
            onClose={() => setEditTableId(null)}
            onTableUpdated={fetchTables}
          />
        )}
      </div>

      <div className="flex justify-around ">
        <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-14 2xl:gap-24">
          {loading ? (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <FaSpinner className="animate-spin text-CC3333 h-8 w-8" />
            </div>
          ) : (
            tables
              .sort((a, b) => Number(a.number) - Number(b.number))
              .map((table) => (
                <li
                  key={table.id}
                  className={`rounded-lg w-48 h-48 ${
                    table.products && table.products.length > 0
                      ? "bg-CC3333 text-white"
                      : "bg-DEDEDE"
                  }`}
                >
                  <div>
                    <div className="text-center p-4">
                      <Link to={`/table/${table.number}`}>
                        <span className="text-base font-bold">
                          Mesa {table.number}
                        </span>
                        <img
                          src={
                            table.products && table.products.length > 0
                              ? occupiedTableImage
                              : freeTableImage
                          }
                          alt={`Mesa ${table.number} - ${
                            table.products && table.products.length > 0
                              ? "Ocupada"
                              : "Livre"
                          }`}
                          className="w-24 h-24 mx-auto mt-2"
                        />
                      </Link>
                      {isAdmin && (
                        <div className="flex justify-end mt-4">
                          <MdEdit
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setEditTableId(table.id);
                              setEditTableNumber(table.number);
                            }}
                            className="cursor-pointer w-5 h-5 mr-2"
                          />
                          <DeleteButtonTable
                            tableId={table.id}
                            email={`table${table.number}@restaurant.com`}
                            onTableDeleted={() =>
                              handleTableDeleted(
                                `Mesa ${table.number} excluída com sucesso!`
                              )
                            }
                            onFetchTables={fetchTables}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </li>
              ))
          )}
        </ul>
      </div>

      {/* Modal de confirmação */}
      {showConfirmation && <ModalConfirmation message={confirmationMessage} />}
    </div>
  );
};

export default TablesAvailable;
