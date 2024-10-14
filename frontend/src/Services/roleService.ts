import { db } from "./firebaseConfig";
import { doc, setDoc, getDoc } from "firebase/firestore";

export const setUserRole = async (uid: string, role: string) => {
  const userRef = doc(db, "users", uid);
  await setDoc(userRef, { role }, { merge: true });
};

export const getUserRole = async (uid: string): Promise<string | null> => {
  const userRef = doc(db, "users", uid);
  const docSnap = await getDoc(userRef);
  if (docSnap.exists()) {
    return docSnap.data().role;
  } else {
    return null;
  }
};
