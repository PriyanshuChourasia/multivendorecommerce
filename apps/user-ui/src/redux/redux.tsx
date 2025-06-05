"use client";
import { useRef } from "react";
import {combineReducers,configureStore,Middleware} from "@reduxjs/toolkit";
import {TypedUseSelectorHook,useDispatch,useSelector,Provider} from "react-redux";
import {setupListeners} from "@reduxjs/toolkit/query";
import {persistStore,persistReducer,FLUSH,REHYDRATE,REGISTER,PAUSE,PERSIST,PURGE} from "redux-persist";
import {PersistGate} from "redux-persist/integration/react";
import createWebStorage from "redux-persist/es/storage/createWebStorage";
import { makeStore } from "./store";




// REDUX TYPES

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// Provider

export default function StoreProvider({children}:{children: React.ReactNode}){
  const storeRef = useRef<AppStore>(null);
  if(!storeRef.current){
    storeRef.current = makeStore();
    setupListeners(storeRef.current.dispatch);
  }
  const persistor = persistStore(storeRef.current);

  return (
    <Provider store={storeRef.current}>
      <PersistGate loading={null} persistor={persistor}>
        {children}
      </PersistGate>
    </Provider>
  )
}
