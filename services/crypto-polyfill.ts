import * as Crypto from 'expo-crypto';
import CryptoJS from 'crypto-js';

// Manual polyfill for CryptoJS which requires a global crypto.getRandomValues for secure encryption
if (typeof global.crypto !== 'object') {
  (global as any).crypto = {};
}

if (typeof (global as any).crypto.getRandomValues !== 'function') {
  (global as any).crypto.getRandomValues = (array: Uint8Array) => {
    return Crypto.getRandomValues(array);
  };
}

// Aggressive override: CryptoJS sometimes caches security state, so we manually bridge its WordArray.random 
// to our native-backed expo-crypto source.
(CryptoJS.lib.WordArray as any).random = function (nBytes: number) {
  const words = [];
  const r = Crypto.getRandomValues(new Uint8Array(nBytes));
  for (let i = 0; i < nBytes; i += 4) {
    words.push((r[i] << 24) | (r[i + 1] << 16) | (r[i + 2] << 8) | r[i + 3]);
  }
  return (CryptoJS.lib.WordArray as any).create(words, nBytes);
};
