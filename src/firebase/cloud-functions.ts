import { httpsCallable } from "firebase/functions";
import { functions } from "./client";

export const sayHello = httpsCallable(functions, "sayHello");
export const generateVid = httpsCallable(functions, "generateVid");
