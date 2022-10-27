import { configureStore } from "@reduxjs/toolkit";
import { useDispatch } from "react-redux";
import mockupReducer from "./slices/mockupReducer";
import postsReducer from "./slices/postsReducer";
import userReducer from "./slices/userReducer";

// ...
const store = configureStore({
  reducer: {
    posts: postsReducer,
    mockups: mockupReducer,
    user: userReducer,
  },
});

// console.log("store", store);
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch: () => AppDispatch = useDispatch; // Export a hook that can be reused to resolve types

export default store;
