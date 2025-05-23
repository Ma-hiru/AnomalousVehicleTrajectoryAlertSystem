import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootStateType } from "@/stores/redux";

interface initialType {
  token: string;
  userProfile: Omit<LoginResponseData, "token">;
}

const userSlice = createSlice({
  name: "userStore",
  initialState: {
    token: "",
    userProfile: {
      username: "test",
      avatar: ""
    }
  } as initialType,
  reducers: {
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
    },
    setUserProfile: (state, action: PayloadAction<Omit<LoginResponseData, "token">>) => {
      state.userProfile = action.payload;
    }
  }
});

export const userActions = userSlice.actions;
export const userReducer = userSlice.reducer;
export const userSelector = (root: RootStateType) => root.userStore;
