# Guide de Configuration Google OAuth 2.0 (Complet)

Ce guide détaille la procédure étape par étape pour configurer l'authentification Google pour l'application **LeaderApp**.

## 📋 Informations Techniques (À conserver précieusement)

Ces valeurs sont spécifiques à votre projet et seront utilisées dans les étapes ci-dessous.

| Paramètre | Valeur |
|-----------|--------|
| **Package Name** | `com.leader.app` |
| **Empreinte SHA-1** | `CC:51:32:F6:B8:02:10:C8:11:59:75:EC:AA:4B:F9:67:AE:EB:0A:11` |
| **URL Privacy** | `https://entreprenariat-beni.com/privacy` |
| **Scopes requis** | `email`, `profile`, `openid` |

---

## Étape 1 : Configuration de l'écran de consentement (Branding)

C'est ce que l'utilisateur voit lorsqu'il clique sur "Se connecter avec Google".

1.  Allez dans la **Google Cloud Console** > **APIs & Services** > **OAuth consent screen** (ou "Branding").
2.  **User Type** : Choisissez **External** (pour que n'importe qui avec un compte Google puisse se connecter).
3.  Cliquez sur **Create**.
4.  Remplissez les informations :
    *   **App Name** : `LeaderApp` (ou le nom commercial).
    *   **User support email** : Votre email.
    *   **App logo** : (Optionnel) Uploadez le logo de l'app.
    *   **App domain** :
        *   *Privacy policy link* : `https://entreprenariat-beni.com/privacy`
        *   *Terms of service link* : (Même URL si vous n'en avez pas d'autre).
    *   **Developer contact information** : Votre email.
5.  Cliquez sur **Save and Continue**.

## Étape 2 : Scopes et Audience

1.  **Scopes** : Cliquez sur **Add or Remove Scopes**.
    *   Sélectionnez `/auth/userinfo.email`, `/auth/userinfo.profile` et `openid`.
    *   Cliquez sur **Update**, puis **Save and Continue**.
2.  **Test Users (Audience)** :
    *   Tant que l'app est en mode "Testing" (pas publiée), vous **DEVEZ** ajouter manuellement les emails des personnes qui vont tester l'app (vous-même, collègues).
    *   Cliquez sur **Add Users** et ajoutez vos adresses Gmail de test.

---

## Étape 3 : Créer le Client Android (Signature)

Ce client sert uniquement à vérifier que l'app mobile est légitime. Il n'est pas utilisé directement dans le code pour l'échange de token, mais il est **indispensable**.

1.  Allez dans **Credentials** (Identifiants) > **Create Credentials** > **OAuth client ID**.
2.  **Application type** : Sélectionnez **Android**.
3.  **Name** : `Leader Android Client`.
4.  **Package name** : Collez `com.leader.app`.
5.  **SHA-1 certificate fingerprint** : Collez `CC:51:32:F6:B8:02:10:C8:11:59:75:EC:AA:4B:F9:67:AE:EB:0A:11`.
6.  Cliquez sur **Create**.

---

## Étape 4 : Créer le Client Web (Token Exchange)

C'est ce client qui va fournir l'ID utilisé par le plugin Capacitor pour initier la connexion.

1.  Allez dans **Credentials** > **Create Credentials** > **OAuth client ID**.
2.  **Application type** : Sélectionnez **Web application**.
3.  **Name** : `Leader Web Client`.
4.  **Authorized JavaScript origins** :
    *   Ajoutez `http://localhost`
    *   Ajoutez `http://localhost:8100` (pour le dév local)
    *   Ajoutez votre domaine de prod si vous avez une version web (ex: `https://v2.entreprenariat-beni.com`).
5.  **Authorized redirect URIs** :
    *   Ajoutez `http://localhost`
    *   Ajoutez `http://localhost:8100`
    *   Ajoutez votre domaine de prod suivi du callback si nécessaire (ex: `https://v2.entreprenariat-beni.com/api/auth/callback`).
6.  Cliquez sur **Create**.
7.  **IMPORTANT** : Une fenêtre s'ouvre avec votre **Client ID**. Copiez-le. Il ressemble à `xxxxxxxx-xxxxxxxx.apps.googleusercontent.com`.

---

## Étape 5 : Intégration dans le Projet

Vous devez mettre à jour deux fichiers avec le **Client ID du Web Client** (celui de l'étape 4).

### 1. `capacitor.config.json`
Mettez à jour la section `GoogleAuth` :

```json
"plugins": {
  "GoogleAuth": {
    "scopes": ["profile", "email"],
    "serverClientId": "VOTRE_NOUVEAU_WEB_CLIENT_ID_ICI.apps.googleusercontent.com",
    "forceCodeForRefreshToken": true
  }
}
```

### 2. `android/app/src/main/res/values/strings.xml`
Mettez à jour la valeur `server_client_id` :

```xml
<string name="server_client_id">VOTRE_NOUVEAU_WEB_CLIENT_ID_ICI.apps.googleusercontent.com</string>
```

### 3. Rebuild (Pour appliquer les changements)
Une fois les fichiers modifiés, lancez ces commandes pour synchroniser le projet Android :

```bash
npx cap sync android
```
Puis relancez le build depuis Android Studio ou en ligne de commande.


Procédure OBLIGATOIRE (Pas à pas vers la solution)
Il faut lier ton projet Google Cloud à Firebase pour récupérer ce petit fichier de configuration.

Ouvre ce lien : https://console.firebase.google.com/
Connecte-toi avec ton compte bntapiru@gmail.com.
Clique sur "Créer un projet" (ou "Add project").
⚠️ TRÈS IMPORTANT : Au moment de donner un nom, regarde s'il y a un menu déroulant ou une suggestion pour sélectionner ton projet Google Cloud existant (celui où tu as créé les clients OAuth).
Pourquoi ? Pour qu'ils partagent les mêmes identifiants. Si tu ne peux pas, crée un nouveau projet, ça marchera quand même, mais c'est plus propre de lier.
Une fois le projet créé/ouvert, clique sur l'icône Android (le petit robot vert au centre ou dans les paramètres du projet).
Remplis le formulaire :
Package name : com.leader.app
App nickname : LeaderApp (optionnel)
SHA-1 : CC:51:32:F6:B8:02:10:C8:11:59:75:EC:AA:4B:F9:67:AE:EB:0A:11
Clique sur Register app.
TÉLÉCHARGE le fichier google-services.json.
Installation
Une fois téléchargé :

Copie ce fichier google-services.json dans le dossier c:\Leader\android\app\ de ton PC.
Dis-le moi ("C'est fait"), et je lancerai la commande finale pour intégrer ce fichier et reconstruire l'APK.