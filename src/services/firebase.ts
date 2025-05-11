
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBmM3MPUUzLT2pf_dIurYOwP9_-J9XlGfY",
  authDomain: "khadma-ai.firebaseapp.com",
  projectId: "khadma-ai",
  storageBucket: "khadma-ai.appspot.com",
  messagingSenderId: "909393540570",
  appId: "1:909393540570:web:8f079656844872c029e5c2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Auth services
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Configure Google provider to request additional profile information
googleProvider.addScope('profile');
googleProvider.addScope('email');
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Firestore database
export const db = getFirestore(app);

// Storage service
export const storage = getStorage(app);

// Demo user credentials
const DEMO_EMAIL = "demo@example.com";
const DEMO_PASSWORD = "demo123";

// Helper function for Google sign-in
export const signInWithGoogle = async () => {
  try {
    console.log("Starting Firebase Google sign in process");
    const result = await signInWithPopup(auth, googleProvider);
    console.log("Firebase Google sign in successful", result.user);
    return { user: result.user, error: null };
  } catch (error: any) {
    console.error("Error during Firebase Google sign in:", error);
    return { user: null, error };
  }
};

// Helper function for email/password sign-in with demo support
export const signInWithEmail = async (email: string, password: string) => {
  try {
    console.log("Starting Firebase email sign in process for:", email);
    
    // Check if using demo credentials
    if (email === DEMO_EMAIL && password === DEMO_PASSWORD) {
      console.log("Using demo credentials - bypassing actual authentication");
      
      // Create a mock user object similar to what Firebase would return
      const mockUser = {
        uid: "demo-user-id",
        email: DEMO_EMAIL,
        displayName: "Demo User",
        emailVerified: true,
        photoURL: null,
        isAnonymous: false,
        metadata: {
          creationTime: new Date().toISOString(),
          lastSignInTime: new Date().toISOString()
        },
        // Add standard Firebase user methods
        getIdToken: () => Promise.resolve("mock-id-token"),
        toJSON: () => ({}),
        // Add properties needed for compatibility with Supabase User
        id: "demo-user-id",
        app_metadata: {},
        user_metadata: {},
        aud: "authenticated",
        created_at: new Date().toISOString()
      };
      
      // Store in localStorage to persist across refreshes
      localStorage.setItem('demoUser', JSON.stringify(mockUser));
      
      return { user: mockUser, error: null };
    }
    
    // Regular Firebase authentication for non-demo credentials
    const result = await signInWithEmailAndPassword(auth, email, password);
    console.log("Firebase email sign in successful");
    return { user: result.user, error: null };
  } catch (error: any) {
    console.error("Error during Firebase email sign in:", error);
    return { user: null, error };
  }
};

// Helper function for email/password sign-up with demo support
export const signUpWithEmail = async (email: string, password: string, displayName: string) => {
  try {
    console.log("Starting Firebase email sign up process for:", email);
    
    // Check if trying to register with demo credentials
    if (email === DEMO_EMAIL) {
      console.log("Using demo email - returning mock user");
      
      // Create a mock user object
      const mockUser = {
        uid: "demo-user-id",
        email: DEMO_EMAIL,
        displayName: displayName || "Demo User",
        emailVerified: true,
        photoURL: null,
        isAnonymous: false,
        metadata: {
          creationTime: new Date().toISOString(),
          lastSignInTime: new Date().toISOString()
        },
        // Add standard Firebase user methods
        getIdToken: () => Promise.resolve("mock-id-token"),
        toJSON: () => ({}),
        // Add properties needed for compatibility with Supabase User
        id: "demo-user-id",
        app_metadata: {},
        user_metadata: {},
        aud: "authenticated",
        created_at: new Date().toISOString()
      };
      
      // Store in localStorage to persist across refreshes
      localStorage.setItem('demoUser', JSON.stringify(mockUser));
      
      return { user: mockUser, error: null };
    }
    
    // Regular Firebase sign up
    const result = await createUserWithEmailAndPassword(auth, email, password);
    
    // Update profile with display name
    if (result.user) {
      await updateProfile(result.user, { displayName });
    }
    
    console.log("Firebase email sign up successful");
    return { user: result.user, error: null };
  } catch (error: any) {
    console.error("Error during Firebase email sign up:", error);
    return { user: null, error };
  }
};

export default app;
