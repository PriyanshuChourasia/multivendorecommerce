import { createSlice, PayloadAction } from "@reduxjs/toolkit";



interface InitialStateTypes{
  isDarkMode:boolean;
}

const initialState:InitialStateTypes={
  isDarkMode:false,
}

export const appThemeSlice = createSlice({
  name:"global",
  initialState,
  reducers:{
    setIsDarkMode:(state,action: PayloadAction<boolean>)=>{
      state.isDarkMode = action.payload;
    }
  }
});

export const {setIsDarkMode} = appThemeSlice.actions;

export default appThemeSlice;
