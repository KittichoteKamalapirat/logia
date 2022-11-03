import { v4 as uuidv4 } from "uuid";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import {
  collection,
  doc,
  getDocs,
  getFirestore,
  query,
  setDoc,
  where,
} from "firebase/firestore";
import {
  getFunctions,
  httpsCallable,
  connectFunctionsEmulator,
} from "firebase/functions";
import { firebaseConfig } from "./config";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const firestore = getFirestore(app);
export const functions = getFunctions(app);
connectFunctionsEmulator(functions, "localhost", 5001);

// cloud-functions
export const sayHello = httpsCallable(functions, "sayHello");
export const generateVid = httpsCallable(functions, "generateVid");
export const loadSecretAndUploadVideo = httpsCallable(
  functions,
  "loadSecretAndUploadVideo"
);

const provider = new GoogleAuthProvider();

export const signInWithGoogle = async () => {
  try {
    console.log("sign in");
    const result = await signInWithPopup(auth, provider);
    console.log("result", result);

    const { email, displayName, photoURL, uid, providerData } = result.user;

    const newUser = {
      uid,
      name: displayName,
      email,
      avatarUrl: photoURL,
      provider: providerData[0].providerId,
    };

    console.log("newUser", newUser);
    // const docRef = await addDoc(collection(firestore, "users"), newUser);
    const userRef = doc(firestore, "users", uid);

    const docRef = await setDoc(userRef, newUser);
  } catch (error) {
    console.log("error", error);
  }
};

export const registerWithEmail = async (email: string, password: string) => {
  try {
    await createUserWithEmailAndPassword(auth, email, password);
  } catch (error) {
    console.log("error", error);
  }
};

export const loginWithEmail = async (email: string, password: string) => {
  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    console.log("error", error);
  }
};

export const logout = () => {
  const response = signOut(auth);
};

export const openCustomerPortal = async () => {
  const functionRef = httpsCallable(
    functions,
    "ext-firestore-stripe-payments-createPortalLink"
  );

  const { data } = await functionRef({
    returnUrl: window.location.origin,
  });

  window.location.assign((data as any)?.url); // todo
};

export const fetchSubscription = async (uid: string) => {
  const subsRef = collection(firestore, "users", uid, "subscriptions");
  const subsQuery = query(
    subsRef,
    where("status", "in", ["trialing", "active", "past_due", "unpaid"])
  );

  const subs = await getDocs(subsQuery);

  if (subs.docs.length > 0) return subs.docs[0].data();

  return null;
};
