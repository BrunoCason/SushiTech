import { doc, updateDoc, collection, query, where, getDocs } from "firebase/firestore";
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { db } from "../../Services/firebaseConfig";

const StartService = () => {
  const { id } = useParams<{ id: string }>(); // Use 'id' ao invés de 'tableNumber'
  const navigate = useNavigate();
  const [tableExists, setTableExists] = useState(false); // Estado para verificar se a mesa existe

  // Verifica se a mesa existe no Firestore
  useEffect(() => {
    const checkTableExists = async () => {
      try {
        const tablesCollectionRef = collection(db, "tables");
        const q = query(tablesCollectionRef, where("number", "==", id)); // Consulta pelo número da mesa
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          console.log("Mesa não encontrada");
          navigate("/error");
          return;
        }

        setTableExists(true);
      } catch (error) {
        console.error(error);
      }
    };

    if (id) {
      checkTableExists(); // Chama a função ao montar o componente
    }
  }, [id, navigate]);

  // Função para iniciar o atendimento
  const handleStartService = async () => {
    if (tableExists && id) {
      try {
        // Encontrar o documento correspondente ao número da mesa
        const tablesCollectionRef = collection(db, "tables");
        const q = query(tablesCollectionRef, where("number", "==", id));
        const querySnapshot = await getDocs(q);
        const tableDoc = querySnapshot.docs[0]; // Usa o primeiro documento encontrado

        if (tableDoc) {
          const tableDocRef = doc(db, "tables", tableDoc.id); // Usa o ID do documento

          // Atualiza o status da mesa
          await updateDoc(tableDocRef, {
            status: "ocupado",
          });

          // Redireciona para a rota da mesa
          navigate(`/table/${id}`);
        }
      } catch (error) {
        console.error(error);
      }
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center">
      <button
        onClick={handleStartService}
        className="bg-CC3333 rounded-md text-2xl font-inter font-bold text-white py-4 px-6 shadow-2xl"
      >
        Iniciar Atendimento
      </button>
    </div>
  );
};

export default StartService;
