import React, { useState, useEffect } from 'react';
import ChangePasswordForm from './ChangePasswordForm';
import DeleteUserConfirmation from './DeleteUserConfirmation';
import { fetchUsers } from '../../Services/userService'; 
import { User, UserListOverlayProps } from "../../Types";
import { RiDeleteBin6Fill } from "react-icons/ri";
import { MdEdit } from "react-icons/md";
import ModalConfirmation from '../ModalConfirmation';

const UserListOverlay: React.FC<UserListOverlayProps> = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [deleteUserEmail, setDeleteUserEmail] = useState<string | null>(null);
  const [modalMessage, setModalMessage] = useState<string | null>(null);

  useEffect(() => {
    // Função para buscar e definir os usuários no estado
    const loadUsers = async () => {
      try {
        const fetchedUsers = await fetchUsers();
        setUsers(fetchedUsers); // Atualiza o estado com os usuários buscados
      } catch (error) {
        console.error("Erro ao buscar usuários:", error);
      }
    };
    
    loadUsers();
  }, []); 

  const handleChangePasswordClick = (email: string) => {
    setSelectedUser(email);
  };

  const handleDeleteUserClick = (email: string) => {
    setDeleteUserEmail(email);
  };

  const handleCloseChangePassword = () => {
    setSelectedUser(null);
    setModalMessage('Senha alterada com sucesso!');
    setTimeout(() => setModalMessage(null), 3000);
  };

  const handleUserDeleted = (email: string) => {
    setUsers(users.filter(user => user.email !== email));
    setModalMessage('Usuário excluído com sucesso!');
    setTimeout(() => setModalMessage(null), 3000);
  };

  return (
    <div className="font-inter font-normal text-base w-80 md:w-96">
        <h3 className="text-lg font-bold text-center mb-14">Usuários</h3>
        {selectedUser ? (
          <ChangePasswordForm email={selectedUser} onClose={handleCloseChangePassword} />
        ) : (
          <ul className="flex flex-col justify-between">
            {users.length > 0 ? (
              users.map((user, index) => (
                <li key={index} className="flex flex-col">
                  <div className="flex items-center justify-between py-2">
                    <div>
                      <p className='mb-1 font-semibold'>{user.name}</p>
                      <p className='text-gray-600'>{user.email}</p>
                    </div>
                    <div className="flex space-x-7">
                      <MdEdit 
                        onClick={() => handleChangePasswordClick(user.email)} 
                        className='h-5 w-5 cursor-pointer' 
                      />
                      <RiDeleteBin6Fill 
                        onClick={() => handleDeleteUserClick(user.email)} 
                        className='h-5 w-5 text-red-600 cursor-pointer' 
                      />
                    </div>
                  </div>
                  {index < users.length - 1 && (
                    <div className="border-b border-black my-2"></div>
                  )}
                </li>
              ))
            ) : (
              <p className="text-gray-500 text-center font-bold">Nenhum usuário encontrado</p>
            )}
          </ul>
        )}
      {deleteUserEmail && (
        <DeleteUserConfirmation
          email={deleteUserEmail}
          onClose={() => setDeleteUserEmail(null)}
          onUserDeleted={handleUserDeleted}
        />
      )}

      {modalMessage && <ModalConfirmation message={modalMessage} />}
    </div>
  );
};

export default UserListOverlay;
