// Shared Firebase bootstrap for czapala.com pages.
// Loads the SDK, initializes the app, and handles the anonymous-auth handshake
// every page needs. Each page still owns its own demoMode fallback (localStorage
// shape differs per page), so this throws on failure rather than swallowing it —
// callers wrap this in their own try/catch.

const SDK_VERSION = "10.12.2";

export async function initFirebase(firebaseConfig){
  const [{ initializeApp }, firestore, authMod] = await Promise.all([
    import(`https://www.gstatic.com/firebasejs/${SDK_VERSION}/firebase-app.js`),
    import(`https://www.gstatic.com/firebasejs/${SDK_VERSION}/firebase-firestore.js`),
    import(`https://www.gstatic.com/firebasejs/${SDK_VERSION}/firebase-auth.js`)
  ]);
  const app = initializeApp(firebaseConfig);
  const db = firestore.getFirestore(app);
  const auth = authMod.getAuth(app);
  return { app, db, auth, firestore, authMod };
}

// Resolves once we know the current auth state, signing in anonymously if
// nobody's signed in yet. Returns the resolved user (may be anonymous).
export async function ensureAnonymousAuth(auth, authMod){
  const firstUser = await new Promise((resolve) => {
    const unsub = authMod.onAuthStateChanged(auth, (user) => {
      unsub();
      resolve(user);
    });
  });
  if (!auth.currentUser) {
    await authMod.signInAnonymously(auth);
  }
  return firstUser;
}
