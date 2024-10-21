import { useState, useEffect } from "react";
import { IoMdNotifications } from "react-icons/io";
import { collection, query, onSnapshot, where } from "firebase/firestore";
import { db } from "../Services/firebaseConfig";

const Notifications = () => {
  const [closingTables, setClosingTables] = useState<string[]>([]); // Armazena os números das mesas em fechamento
  const [showDropdown, setShowDropdown] = useState(false); // Controla a visibilidade do retângulo

  useEffect(() => {
    // Cria uma query para buscar mesas com status "fechamento"
    const tablesCollectionRef = collection(db, "tables");
    const q = query(tablesCollectionRef, where("status", "==", "fechamento"));

    // Ouve mudanças em tempo real nas mesas com status "fechamento"
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const closingTablesList: string[] = [];

      querySnapshot.forEach((doc) => {
        const tableData = doc.data();
        if (tableData?.number) {
          closingTablesList.push(tableData.number);
        }
      });

      // Atualiza o estado com os números das mesas em fechamento
      setClosingTables(closingTablesList);
    });

    return () => unsubscribe(); // Limpa o listener ao desmontar o componente
  }, []);

  // Função para alternar a visibilidade do dropdown
  const handleIconClick = () => {
    setShowDropdown((prevShowDropdown) => !prevShowDropdown);
  };

  return (
    <>
      {closingTables.length > 0 && (
        <div className="fixed bottom-10 right-10 z-40">
          <div className="relative flex flex-col items-end">
            <IoMdNotifications
              className="text-white bg-CC3333 h-10 w-10 rounded-full p-2 cursor-pointer"
              onClick={handleIconClick}
            />

            {showDropdown && (
              <div className="absolute bottom-14 right-0 bg-white shadow-lg rounded-md p-4 w-48 z-50">
                <h4 className="text-black font-bold mb-2">Mesas para fechar:</h4>
                <ul>
                  {closingTables.map((tableNumber) => (
                    <li key={tableNumber} className="text-black">
                      Mesa {tableNumber}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Notifications;
