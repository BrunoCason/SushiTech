import { getDocs, collection, doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from './firebaseConfig';
import { User } from '../Types';

// Função para buscar todos os usuários
export const fetchUsers = async (): Promise<User[]> => {
  try {
    const usersCollection = collection(db, 'users');
    const userSnapshot = await getDocs(usersCollection);

    // Garante que os campos de email e role estejam presentes nos documentos
    const userList: User[] = userSnapshot.docs.map(doc => {
      const data = doc.data();
      
      // Verifica se o email e role existem e os define, ou lança um erro
      return {
        id: doc.id,
        email: data.email || 'email não disponível',  // Garante que tenha um valor de email
        role: data.role || 'user',  // Define um valor padrão para role, se necessário
        name: data.name,
      };
    });

    return userList;
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    throw error;
  }
};

// Função para buscar dados de perfil de um usuário específico
export const fetchUserProfile = async (uid: string) => {
  try {
    const userDoc = doc(db, 'users', uid);
    const userSnapshot = await getDoc(userDoc);

    if (!userSnapshot.exists()) {
      throw new Error('Usuário não encontrado');
    }

    return userSnapshot.data() as { name?: string; phone?: string };
  } catch (error) {
    console.error('Erro ao buscar perfil do usuário:', error);
    throw error;
  }
};

// Função para atualizar o perfil do usuário
export const updateUserProfile = async (uid: string, profileData: { name?: string; phone?: string }) => {
  try {
    const userDoc = doc(db, 'users', uid);
    await updateDoc(userDoc, profileData);
  } catch (error) {
    console.error('Erro ao atualizar perfil do usuário:', error);
    throw error;
  }
};
