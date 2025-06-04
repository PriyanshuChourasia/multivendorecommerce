import createWebStorage from "redux-persist/lib/storage/createWebStorage";

import {persistReducer} from "redux-persist";
import { combineReducers, Reducer } from "@reduxjs/toolkit";
import { api } from "./api";
import appThemeSlice from "./state/theme";


// Redux Persistence
const createNoopStorage = () =>{
  return {
    getItem(_key: any){
      return Promise.resolve(null);
    },
    setItem(_key:any,value:any){
      return Promise.resolve(value);
    },
    removeItem(_key:any){
      return Promise.resolve();
    }
  }
};

const storage = typeof window === "undefined" ? createNoopStorage() : createWebStorage("local");

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["global"],
};

const rootReducer = combineReducers({
  global: appThemeSlice.reducer,
  [api.reducerPath]: api.reducer
})




export const persistedReducer = persistReducer(persistConfig,rootReducer) as Reducer;
