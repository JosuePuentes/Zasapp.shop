import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

let firebaseApp: ReturnType<typeof initializeApp> | null = null;
let messaging: ReturnType<typeof getMessaging> | null = null;

export function setupFirebase(firebaseConfig: Record<string, unknown> | null | undefined) {
  if (!firebaseConfig?.apiKey) {
    return { firebaseApp: null, messaging: null };
  }
  if (!firebaseApp) {
    try {
      firebaseApp = initializeApp(firebaseConfig);
      messaging = getMessaging(firebaseApp);
    } catch (e) {
      console.warn("Firebase init skipped:", e);
      return { firebaseApp: null, messaging: null };
    }
  }
  return { firebaseApp, messaging };
}

export { getToken, onMessage };

