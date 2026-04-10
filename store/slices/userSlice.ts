import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserState {
  name: string;
  email: string;
  image: string | null;
  isAuthenticated: boolean;
  hasPassword: boolean;
}

const initialState: UserState = {
  name: 'Vault User',
  email: 'user@sudarshan.vault',
  image: null,
  isAuthenticated: false,
  hasPassword: false,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    updateProfile: (state, action: PayloadAction<Partial<UserState>>) => {
      return { ...state, ...action.payload };
    },
    logout: (state) => {
      state.isAuthenticated = false;
    },
  },
});

export const { updateProfile, logout } = userSlice.actions;
export default userSlice.reducer;
