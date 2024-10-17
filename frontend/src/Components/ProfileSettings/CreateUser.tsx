import React, { useState } from "react";
import InputMask from "react-text-mask";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "../../firebaseAuth";
import { db } from "../../Services/firebaseConfig";
import { doc, setDoc } from "firebase/firestore";
import { FaEye, FaEyeSlash, FaSpinner } from "react-icons/fa";
import { FaUserLarge } from "react-icons/fa6";
import { MdEmail } from "react-icons/md";
import { FaPhoneAlt } from "react-icons/fa";
import {
  validateName,
  validatePhone,
  validateEmail,
  validatePassword,
  phoneMask,
} from "../../utils/validateUser";
import ModalConfirmation from "../ModalConfirmation";

const CreateUser = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [nameError, setNameError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState<
    string | null
  >(null);
  const [modalMessage, setModalMessage] = useState<string>("");
  const [showModalMessage, setShowModalMessagel] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setNameError(null);
    setPhoneError(null);
    setEmailError(null);
    setPasswordError(null);
    setConfirmPasswordError(null);

    let hasError = false;

    if (!validateName(name)) {
      setNameError("Nome inválido.");
      hasError = true;
    }

    if (!validatePhone(phone)) {
      setPhoneError("Telefone inválido.");
      hasError = true;
    }

    if (!validateEmail(email)) {
      setEmailError("Email inválido.");
      hasError = true;
    }

    if (!validatePassword(password)) {
      setPasswordError("A senha deve ter pelo menos 8 caracteres.");
      hasError = true;
    }

    if (password !== confirmPassword) {
      setConfirmPasswordError("As senhas não coincidem.");
      hasError = true;
    }

    if (hasError) return;

    // Abre o modal para solicitar a senha do administrador
    setShowModal(true);
  };

  const handleAdminAuth = async () => {
    const adminEmail = auth.currentUser?.email || "";

    if (!adminPassword) {
      setError("Senha do administrador necessária.");
      return;
    }

    setLoading(true);

    try {
      // Cria o novo usuário
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Cria o documento no Firestore
      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        name,
        phone,
        role: isAdmin ? "admin" : "user", // Define o papel como admin ou user
      });

      // Reautentica o administrador
      await signInWithEmailAndPassword(auth, adminEmail, adminPassword);

      setModalMessage("Usuário criado com sucesso!");
      setShowModalMessagel(true);
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setName("");
      setPhone("");
      setIsAdmin(false);
      setShowModal(false);
      setAdminPassword("");

      // Fecha o modal após 3 segundos
      setTimeout(() => setShowModalMessagel(false), 3000);
    } catch (err) {
      if ((err as Error).message.includes("auth/email-already-in-use")) {
        setError("Este e-mail já está em uso. Tente um e-mail diferente.");
      } else {
        setError(
          "Erro ao criar usuário. Verifique as informações e tente novamente."
        );
      }
      setShowModal(false);
      setAdminPassword("");
    } finally {
      setLoading(false); // Para o loading após o processamento
    }
  };

  return (
    <div className="font-inter font-normal text-base text-black w-80 md:w-96">
      <h2 className="text-center font-bold text-xl mb-7">Novo Usuário</h2>
      <form onSubmit={handleCreateUser}>
        <div className="mb-4 relative">
          <label className="block text-gray-700">Nome</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={`py-2 border-b placeholder:text-D4D4D4 focus:outline-none w-80 md:w-96 ${
              nameError ? "border-red-500" : "border-black"
            }`}
            placeholder="Digite o nome"
          />
          <FaUserLarge className="absolute inset-y-0 right-0 mt-11 mr-2 h-3 w-3" />
          {nameError && <p className="text-red-500 mt-2">{nameError}</p>}
        </div>
        <div className="mb-4 relative">
          <label className="block text-gray-700">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`py-2 border-b placeholder:text-D4D4D4 focus:outline-none w-80 md:w-96 ${
              emailError ? "border-red-500" : "border-black"
            }`}
            placeholder="Digite o e-mail"
          />
          <MdEmail className="absolute inset-y-0 right-0 mt-10 mr-2 h-4 w-4" />
          {emailError && <p className="text-red-500 mt-2">{emailError}</p>}
        </div>
        <div className="mb-4 relative">
          <label className="block text-gray-700">Telefone</label>
          <InputMask
            mask={phoneMask}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className={`py-2 border-b placeholder:text-D4D4D4 focus:outline-none w-80 md:w-96 ${
              phoneError ? "border-red-500" : "border-black"
            }`}
            placeholder="Digite o telefone"
          />
          <FaPhoneAlt className="absolute inset-y-0 right-0 mt-10 mr-2 h-3 w-3" />
          {phoneError && <p className="text-red-500 mt-2">{phoneError}</p>}
        </div>
        <div className="mb-4 relative">
          <label className="block text-gray-700">Senha</label>
          <input
            type={passwordVisible ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`py-2 border-b placeholder:text-D4D4D4 focus:outline-none w-80 md:w-96 ${
              passwordError ? "border-red-500" : "border-black"
            }`}
            placeholder="Digite a senha"
          />
          <button
            type="button"
            onClick={() => setPasswordVisible(!passwordVisible)}
            className="absolute mt-4 right-0 px-2 cursor-pointer"
          >
            {passwordVisible ? <FaEyeSlash /> : <FaEye />}
          </button>
          {passwordError && (
            <p className="text-red-500 mt-2">{passwordError}</p>
          )}
        </div>
        <div className="mb-4 relative">
          <label className="block text-gray-700">Confirmar Senha</label>
          <input
            type={confirmPasswordVisible ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={`py-2 border-b placeholder:text-D4D4D4 focus:outline-none w-80 md:w-96 ${
              confirmPasswordError ? "border-red-500" : "border-black"
            }`}
            placeholder="Confirme a senha"
          />
          <button
            type="button"
            onClick={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
            className="absolute mt-4 right-0 px-2 cursor-pointer"
          >
            {confirmPasswordVisible ? <FaEyeSlash /> : <FaEye />}
          </button>
          {confirmPasswordError && (
            <p className="text-red-500 mt-2">{confirmPasswordError}</p>
          )}
        </div>
        <div className="mb-6">
          <label className="inline-flex items-center text-gray-700">
            <input
              type="checkbox"
              checked={isAdmin}
              onChange={() => setIsAdmin(!isAdmin)}
              className="form-checkbox"
            />
            <span className="ml-2">Administrador</span>
          </label>
        </div>
        <button
          type="submit"
          className="w-full bg-CC3333 text-white font-bold py-2 px-4 rounded-md"
        >
          Criar
        </button>
        {error && <p className="text-red-500 mt-2">{error}</p>}
        {showModalMessage && <ModalConfirmation message={modalMessage} />}
      </form>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white py-8 rounded-lg shadow-md font-bold text-white text-center text-base">
            <p className="text-black font-medium mb-6">
              Insira a senha de administrador
            </p>
            <input
              type="password"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              className={`pb-2 mx-20 border-b placeholder:text-D4D4D4 focus:outline-none w-64 font-normal text-black placeholder:font-normal mb-8 ${
                error ? "border-red-500" : "border-black"
              }`}
              placeholder="Senha do administrador"
            />
            <br />
            <div className="flex justify-between px-20">
              <button
                onClick={() => setShowModal(false)}
                className="bg-ADABAC text-white py-2 px-4 rounded-md"
              >
                Cancelar
              </button>
              <button
                onClick={handleAdminAuth}
                className="bg-CC3333 text-white py-2 px-4 rounded-md"
              >
                Confirmar
                {loading && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <FaSpinner className="animate-spin text-CC3333 h-8 w-8" />
                  </div>
                )}
              </button>
            </div>
            {error && <p className="text-red-500 mt-2">{error}</p>}
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateUser;
