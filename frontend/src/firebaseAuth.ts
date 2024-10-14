import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword  } from "firebase/auth";
import firebaseConfig from "./Services/firebaseConfig"

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const signInWithEmail = (email: string, password: string) => {
  return signInWithEmailAndPassword(auth, email, password);
};

export { auth, signInWithEmail };
