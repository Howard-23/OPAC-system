# 🔥 Firebase Sync Setup Guide (May 2026)

This guide provides the official step-by-step instructions for connecting an **infoLib** desktop instance to the Firebase Synchronization backend.

---

## Phase 1: Project & App Registration

1.  **Firebase Console**: Navigate to [console.firebase.google.com](https://console.firebase.google.com/).
2.  **Create Project**: Click **"Add project"** and name it `opac-lib`.
3.  **Add Web App**: 
    *   Click the **`+ Add app`** button under the project title.
    *   Select the **Web (`</>`)** icon.
    *   Nickname: `infoLib-Desktop`.
    *   **Do NOT** check the box for Firebase Hosting.
    *   Click **Register app**.
4.  **Config Extraction**: Copy the values from the `firebaseConfig` object (ApiKey, AuthDomain, ProjectId, AppId).

---

## Phase 2: Online Database & Security

### 1. Cloud Firestore (Database)
*   Go to **Build > Firestore Database** in the left sidebar.
*   Click **Create database**.
*   Select **Standard Edition** (if prompted).
*   **Location**: Select `asia-southeast1 (Singapore)` or the region closest to the library.
*   **Security Rules**: Choose **"Start in test mode"**. This allows initial synchronization without strict authentication blocks.
*   Click **Create**.

### 2. Anonymous Authentication (Security)
*   Go to **Build > Authentication** in the left sidebar.
*   Click **Get started**.
*   Under the **Sign-in method** tab, click **"Anonymous"**.
*   Toggle the **Enable** switch to ON and click **Save**.
*   *Note: This allows the desktop app to securely identify itself to Firebase without user intervention.*

---

## Phase 3: Desktop App Configuration

Open the `.env` file in the root of your `lib-mgmt` directory and populate it with the keys obtained in Phase 1:

```env
# infoLib Firebase Configuration
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=opac-lib.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=opac-lib
VITE_FIREBASE_APP_ID=1:59152381566:web:...
```

---

## Phase 4: Verification

1.  **Restart the App**: Run `bunx tauri dev` or `npm run tauri dev`.
2.  **Trigger Sync**: Click the **"Sync Now"** button in the main toolbar.
3.  **Audit Logs**:
    *   Click the dropdown arrow on the Sync button to open the **Sync Logs Dialog**.
    *   Confirm the status: `Synchronization completed successfully`.
4.  **Live Verification**: Refresh the **Cloud Firestore** tab in your browser. You should now see collections (e.g., `catalog`, `patrons`) populated with the local library data.

---

> [!CAUTION]
> **Production Rules**: After 30 days, Firebase test mode rules will expire. To keep the sync working, navigate to **Firestore > Rules** and update them to:
> ```javascript
> allow read, write: if request.auth != null;
> ```
