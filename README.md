# Sudarshan Vault ☸️

Sudarshan is a premium, high-security MFA (Multi-Factor Authentication) vault designed with an absolute focus on privacy, offline-first reliability, and a sleek obsidian aesthetic.

![Version](https://img.shields.io/badge/version-1.0.0--Alpha-black?style=for-the-badge)
![Platform](https://img.shields.io/badge/platform-Android%20%7C%20iOS-white?style=for-the-badge)
![Security](https://img.shields.io/badge/Security-Hardware--Backed-green?style=for-the-badge)

## ✨ Features

- **Offline-First Architecture**: Your secrets never touch the internet. All calculations and storage happen locally on your device.
- **Vault Health Audit**: Real-time security scoring that helps you identify weak secrets or missing privacy settings.
- **Hardware-Backed Encryption**: Utilizes device-specific secure enclaves for key storage.
- **Flexible Import/Export**: Encrypted local backups and secure transfer codes for migrating between devices.
- **Pure Privacy**: Screenshot protection and biometric auto-lock (FaceID/Fingerprint) support.

## 🛠️ Tech Stack

- **Framework**: [Expo](https://expo.dev/) (React Native)
- **State Management**: [Redux Toolkit](https://redux-toolkit.js.org/) with Redux Persist
- **Storage**: [Expo SecureStore](https://docs.expo.dev/versions/latest/sdk/secure-store/)
- **Styling**: Vanilla React Native StyleSheet with dynamic theme tokens
- **Navigation**: [Expo Router](https://docs.expo.dev/router/introduction/) (File-based routing)

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- npm or yarn
- Expo Go (for development) or EAS CLI (for building)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/AyushDocs/Sudarshan
   cd Sudarshan
   ```

2. Install dependencies:
   ```bash
   npm install --legacy-peer-deps
   ```

3. Start the development server:
   ```bash
   npm start
   ```

## 📦 Building for Production

This project is configured for **EAS Build**.

### Generate APK (Android)

To generate a standalone APK for testing or side-loading:
```bash
npx eas-cli build -p android --profile preview
```

### 📥 Download Latest APK
You can download the latest pre-built APK for Android here:
[Download Sudarshan APK](https://expo.dev/accounts/ayushdubey28/projects/Sudarshan/builds/ea3db22d-e680-4c68-999b-5ba03fa8d656)

### Build for Play Store/App Store
```bash
npx eas-cli build -p android --profile production
```

## 🔒 Security Posture

Sudarshan adheres to the following security standards:
- **TOTP/HOTP**: Support for SHA1 (Standard), SHA256, and SHA512.
- **No Telemetry**: No tracking, no analytics, no external pings.
- **Local-Only Backups**: Backups are stored as encrypted JSON files in your internal storage.

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---