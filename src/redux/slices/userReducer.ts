import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { addDoc, collection, doc, setDoc } from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";
import { auth, firestore } from "../../firebase/client";

export interface User {
  id: string;
  email: string;
}

export interface UserCredentials {
  email: string;
  password: string;
}

const initialState: User = { id: "", email: "" };

export const createUser = createAsyncThunk(
  "users/createUser",
  async (user: UserCredentials) => {
    try {
      console.log("create user in redux");
      const newUser = {
        id: uuidv4(),
        email: user.email,
        password: user.password,
      };

      console.log("newUser", newUser);
      const userDocRef = doc(
        firestore as any,
        "users",
        auth.currentUser?.uid as string
      );

      const docRef = await setDoc(userDocRef, newUser);

      console.log("docRef", docRef);

      return docRef;
    } catch (error) {
      console.log("error", error);
    }
  }
);
export const UserSlice = createSlice({
  name: "Users",
  initialState,
  reducers: {
    updateUsers: (state, action) => {
      return action.payload;
    },
  },
  extraReducers: {
    [createUser.pending as any]: (state, action) => {
      console.log("pending state", state);
    },
    [createUser.fulfilled as any]: (state, action) => {
      console.log("fulfileed state", state);
    },
    [createUser.rejected as any]: (state, action) => {
      console.log("rejected state", state);
    },
  },
});

export const { updateUsers } = UserSlice.actions;

export default UserSlice.reducer;
