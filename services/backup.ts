import './crypto-polyfill';
import CryptoJS from 'crypto-js';

const BACKUP_HEADER = 'SUDARSHAN_VAULT_V1';

export const encryptBackup = (data: any, password: string): string => {
  const json = JSON.stringify(data);
  const encrypted = CryptoJS.AES.encrypt(json, password).toString();
  // We prepend a header to identify our files
  return `${BACKUP_HEADER}:${encrypted}`;
};

export const decryptBackup = (encryptedData: string, password: string): any => {
  if (!encryptedData.startsWith(`${BACKUP_HEADER}:`)) {
    throw new Error('Invalid backup file format');
  }

  const rawEncrypted = encryptedData.replace(`${BACKUP_HEADER}:`, '');
  const bytes = CryptoJS.AES.decrypt(rawEncrypted, password);
  const decrypted = bytes.toString(CryptoJS.enc.Utf8);
  
  if (!decrypted) {
    throw new Error('Incorrect password or corrupted file');
  }

  return JSON.parse(decrypted);
};
