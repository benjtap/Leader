# Analyse du Mécanisme de Login et Sync

## État Actuel

J'ai analysé les fichiers `src/views/LoginView.vue`, `src/services/mobileSyncService.js`, et les fichiers Android natifs.

### 1. LoginView.vue
- Utilise ID + Téléphone + OTP.
- N'utilise PAS Google Identity ou AccountManager.

### 2. mobileSyncService.js
- Récupère les contacts via `@capacitor-community/contacts`.
- Récupère les journaux d'appels via `cordova-plugin-calllog`.
- **MANQUANT**: Aucune trace de `AccountManager`, de tokens OAuth 2.0, ou de connexion Gmail/Outlook.

## Conclusion
Le code actuel ne correspond pas à votre description ("L'application utilise AccountManager..."). La fonctionnalité de choix de compte Google est absente du code source.

## Plan d'Action
Je vais restructurer `mobileSyncService.js` pour qu'il soit plus propre et prêt à accueillir l'intégration Google Auth (via `@codetrix-studio/capacitor-google-auth`) que nous devrons installer pour obtenir ce comportement.
