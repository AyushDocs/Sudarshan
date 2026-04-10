import { configureStore, combineReducers } from '@reduxjs/toolkit';
import storage from '@react-native-async-storage/async-storage';
import { persistStore, persistReducer } from 'redux-persist';
import createSecureStore from 'redux-persist-expo-securestore';
import authReducer from './slices/authSlice';
import settingsReducer from './slices/settingsSlice';
import userReducer from './slices/userSlice';

// Create a secure storage engine for sensitive MFA secrets
const secureStorage = createSecureStore();

// Configuration for sensitive auth data (MFA Secrets) using SecureStore
const authPersistConfig = {
  key: 'auth',
  storage: secureStorage,
};

// Configuration for general settings and user profile using standard AsyncStorage
const rootPersistConfig = {
  key: 'root',
  storage: storage,
  whitelist: ['settings', 'user'], // persist standard data in AsyncStorage
};

const rootReducer = combineReducers({
  // Only the 'auth' slice is persisted in SecureStore
  auth: persistReducer(authPersistConfig, authReducer),
  settings: settingsReducer,
  user: userReducer,
});

const persistedReducer = persistReducer(rootPersistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
