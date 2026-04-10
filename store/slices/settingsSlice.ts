import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SettingsState {
  privacyEnabled: boolean;
  isLocked: boolean;
  hasSeenOnboarding: boolean;
  theme: 'dark' | 'light';
}

const initialState: SettingsState = {
  privacyEnabled: false,
  isLocked: false,
  hasSeenOnboarding: false,
  theme: 'dark',
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setPrivacyEnabled: (state, action: PayloadAction<boolean>) => {
      state.privacyEnabled = action.payload;
      if (action.payload) {
        state.isLocked = true;
      } else {
        state.isLocked = false;
      }
    },
    setLocked: (state, action: PayloadAction<boolean>) => {
      state.isLocked = action.payload;
    },
    setHasSeenOnboarding: (state) => {
      state.hasSeenOnboarding = true;
    },
    setTheme: (state, action: PayloadAction<'dark' | 'light'>) => {
      state.theme = action.payload;
    },
  },
});

export const { setPrivacyEnabled, setLocked, setHasSeenOnboarding, setTheme } = settingsSlice.actions;
export default settingsSlice.reducer;
