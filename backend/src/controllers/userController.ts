import { Request, Response } from 'express';
import admin from '../config/firebase';

// Função para alterar a senha de um usuário
export const changePassword = async (req: Request, res: Response): Promise<void> => {
  const { email, newPassword } = req.body;
  
  if (!email || !newPassword) {
    res.status(400).send('Email e nova senha são necessários.');
    return;
  }
  
  try {
    const user = await admin.auth().getUserByEmail(email);
    await admin.auth().updateUser(user.uid, { password: newPassword });
    res.status(200).send('Senha alterada com sucesso.');
  } catch (error) {
    console.error('Erro ao alterar a senha:', error);
    res.status(500).send('Erro ao alterar a senha.');
  }
};

// Função para excluir um usuário
export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body;

  try {
    const userRecord = await admin.auth().getUserByEmail(email);
    const uid = userRecord.uid;

    await admin.auth().deleteUser(uid);
    await admin.firestore().collection('users').doc(uid).delete();

    res.status(200).json({ message: 'Usuário excluído com sucesso.', uid });
  } catch (error) {
    console.error('Erro ao excluir usuário:', error);
    res.status(500).json({ error: 'Erro ao excluir usuário.' });
  }
};

// Função para criar um usuário para a mesa
export const createTableUser = async (req: Request, res: Response): Promise<void> => {
  const { tableNumber } = req.body;

  if (!tableNumber) {
    res.status(400).send('O número da mesa é necessário.');
    return;
  }

  const email = `mesa${tableNumber}@sushitech.com`;
  const password = `SushiTech${tableNumber}`;

  try {
    // Cria o usuário
    const userRecord = await admin.auth().createUser({
      email,
      password,
    });

    // Retorna o ID do usuário criado
    res.status(201).json({ userId: userRecord.uid });
  } catch (error) {
    console.error('Erro ao criar usuário da mesa:', error);
    res.status(500).send('Erro ao criar usuário da mesa.');
  }
};
