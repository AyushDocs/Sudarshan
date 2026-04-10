import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TimeStampMFACodeType, NonceMFACodeType } from '../../services/index';

export type AuthItem = (TimeStampMFACodeType & { type: 'time' }) | (NonceMFACodeType & { type: 'nonce' });

interface AuthState {
  accounts: AuthItem[];
}

const initialState: AuthState = {
  accounts: [
    {
      id: 1,
      type: 'time',
      code: 'Google: user@gmail.com',
      secret: 'JBSWY3DPEHPK3PXP',
      algo: 'SHA1',
      digits: 6,
      timeStamp: Date.now(),
      interval: 30
    },
    {
      id: 2,
      type: 'time',
      code: 'GitHub: developer',
      secret: 'SECRET_KEY_GITHUB',
      algo: 'SHA256',
      digits: 6,
      timeStamp: Date.now(),
      interval: 30
    },
  ],
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    addAccount: (state, action: PayloadAction<AuthItem>) => {
      state.accounts.push(action.payload);
    },
    importAccounts: (state, action: PayloadAction<AuthItem[]>) => {
      // Avoid duplicates based on secret
      const existingSecrets = new Set(state.accounts.map(a => a.secret));
      const newAccounts = action.payload.filter(a => !existingSecrets.has(a.secret));
      state.accounts = [...state.accounts, ...newAccounts];
    },
    removeAccount: (state, action: PayloadAction<number>) => {
      state.accounts = state.accounts.filter(a => a.id !== action.payload);
    },
  },
});

export const { addAccount, importAccounts, removeAccount } = authSlice.actions;
export default authSlice.reducer;
