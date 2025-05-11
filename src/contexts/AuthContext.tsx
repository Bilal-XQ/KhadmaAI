
import React, { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "../integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { auth } from "../services/firebase";
import { onAuthStateChanged } from "firebase/auth";

// For demo mode
interface DemoUser {
  uid: string;
  email: string;
  displayName: string;
  emailVerified: boolean;
  photoURL: string | null;
  isAnonymous: boolean;
  metadata: {
    creationTime: string;
    lastSignInTime: string;
  };
  // Add missing properties to make DemoUser compatible with User
  id: string; // Add this for compatibility
  app_metadata: any;
  user_metadata: any;
  aud: string;
  created_at: string;
  getIdToken?: () => Promise<string>;
  toJSON?: () => object;
}

interface Profile {
  id: string;
  full_name?: string;
  avatar_url?: string;
  linkedin_url?: string;
  github_url?: string;
  cv_url?: string;
  voice_pitch_url?: string;
  bio?: string;
  skills?: string[];
  updated_at?: string;
}

interface AuthContextType {
  currentUser: User | DemoUser | null;
  session: Session | null;
  loading: boolean;
  profile: Profile | null;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  isAdmin: boolean;
  isDemoMode: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | DemoUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);

  // Handle demo mode
  const activateDemoMode = (demoUser: DemoUser) => {
    console.log("Activating demo mode with user:", demoUser);
    setCurrentUser(demoUser);
    setIsDemoMode(true);
    
    // Create a demo profile
    const demoProfile: Profile = {
      id: demoUser.uid,
      full_name: demoUser.displayName,
      avatar_url: "https://api.dicebear.com/6.x/initials/svg?seed=DU",
      bio: "This is a demo account with limited functionality.",
      skills: ["Demo", "Testing", "Web Development"],
      updated_at: new Date().toISOString()
    };
    
    setProfile(demoProfile);
    setIsAdmin(true); // Grant admin access for demo
    setLoading(false);
  };

  // Check for demo user in local storage on initial load
  useEffect(() => {
    const storedDemoUser = localStorage.getItem('demoUser');
    if (storedDemoUser) {
      try {
        const demoUser = JSON.parse(storedDemoUser);
        // Add required User properties to DemoUser for compatibility
        demoUser.id = demoUser.uid;
        demoUser.app_metadata = {};
        demoUser.user_metadata = {};
        demoUser.aud = "authenticated";
        demoUser.created_at = demoUser.metadata?.creationTime || new Date().toISOString();
        
        activateDemoMode(demoUser);
      } catch (error) {
        console.error("Error parsing demo user from localStorage:", error);
        localStorage.removeItem('demoUser');
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  // Set up Firebase Auth listener
  useEffect(() => {
    if (!isDemoMode) {
      const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        if (firebaseUser) {
          console.log("Firebase user detected:", firebaseUser.email);
          
          // Create a compatible user object from Firebase user
          const compatibleUser: DemoUser = {
            uid: firebaseUser.uid,
            id: firebaseUser.uid, // Add id for compatibility
            email: firebaseUser.email || "no-email",
            displayName: firebaseUser.displayName || "User",
            emailVerified: firebaseUser.emailVerified,
            photoURL: firebaseUser.photoURL,
            isAnonymous: firebaseUser.isAnonymous,
            metadata: {
              creationTime: firebaseUser.metadata.creationTime || new Date().toISOString(),
              lastSignInTime: firebaseUser.metadata.lastSignInTime || new Date().toISOString()
            },
            app_metadata: {},
            user_metadata: {},
            aud: "authenticated",
            created_at: firebaseUser.metadata.creationTime || new Date().toISOString(),
            getIdToken: () => firebaseUser.getIdToken()
          };
          
          setCurrentUser(compatibleUser);
          
          // Create basic session object - include token_type field for TypeScript compatibility
          const mockSession: Session = {
            access_token: "firebase-token",
            refresh_token: "firebase-refresh",
            expires_at: Date.now() + 3600,
            expires_in: 3600,
            token_type: "bearer", // Add this field to fix the TypeScript error
            user: compatibleUser as any
          };
          
          setSession(mockSession);
          
          // Set up basic profile
          setProfile({
            id: firebaseUser.uid,
            full_name: firebaseUser.displayName || "User",
            avatar_url: firebaseUser.photoURL || undefined,
            updated_at: new Date().toISOString()
          });
          
          setIsAdmin(true); // For demo purposes
          setLoading(false);
        } else {
          // No Firebase user, check if we're using Supabase
          if (!currentUser || (currentUser as any).uid?.startsWith("demo")) {
            setLoading(false);
          }
        }
      });
      
      return () => unsubscribe();
    }
  }, [isDemoMode, currentUser]);

  // Fetch user profile
  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Error fetching profile:", error.message);
        return null;
      }

      return data as Profile;
    } catch (error) {
      console.error("Unexpected error fetching profile:", error);
      return null;
    }
  };

  // Check if user is admin
  const checkAdminRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .eq("role", "admin")
        .single();

      if (error && error.code !== "PGRST116") { // PGRST116 is no rows returned error
        console.error("Error checking admin role:", error.message);
        return false;
      }

      return !!data;
    } catch (error) {
      console.error("Unexpected error checking admin role:", error);
      return false;
    }
  };

  // Function to refresh user profile
  const refreshProfile = async () => {
    if (!currentUser || isDemoMode) return;
    
    const fetchedProfile = await fetchProfile((currentUser as User).id);
    if (fetchedProfile) {
      setProfile(fetchedProfile);
    }
    
    const adminStatus = await checkAdminRole((currentUser as User).id);
    setIsAdmin(adminStatus);
  };

  // Update user profile
  const updateProfile = async (updates: Partial<Profile>) => {
    if (!currentUser) return;

    // For demo users, just update the local profile
    if (isDemoMode) {
      setProfile(prev => {
        const updatedProfile = { 
          ...prev, 
          ...updates,
          updated_at: new Date().toISOString() 
        } as Profile;
        
        toast({
          title: "Profile updated",
          description: "Your demo profile has been updated (changes won't persist after page refresh)."
        });
        
        return updatedProfile;
      });
      return;
    }

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq("id", (currentUser as User).id);

      if (error) {
        toast({
          title: "Error updating profile",
          description: error.message,
          variant: "destructive"
        });
        throw error;
      }

      await refreshProfile();
      
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully."
      });
    } catch (error: any) {
      console.error("Error updating profile:", error.message);
      throw error;
    }
  };

  // Sign up with email and password
  const signUp = async (email: string, password: string, displayName: string) => {
    try {
      setLoading(true);
      
      // Check if using demo credentials
      if (email === "demo@example.com") {
        console.log("Demo sign up requested");
        
        const demoUser: DemoUser = {
          uid: "demo-user-id",
          id: "demo-user-id", // Add id for compatibility
          email: "demo@example.com",
          displayName: displayName || "Demo User",
          emailVerified: true,
          photoURL: null,
          isAnonymous: false,
          metadata: {
            creationTime: new Date().toISOString(),
            lastSignInTime: new Date().toISOString()
          },
          app_metadata: {},
          user_metadata: {},
          aud: "authenticated",
          created_at: new Date().toISOString()
        };
        
        // Store in localStorage to persist across refreshes
        localStorage.setItem('demoUser', JSON.stringify(demoUser));
        
        // Activate demo mode
        activateDemoMode(demoUser);
        
        toast({
          title: "Demo account created",
          description: "You are now signed in with a demo account."
        });
        
        return;
      }
      
      // Regular sign up using Supabase
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: displayName
          }
        }
      });

      if (error) {
        toast({
          title: "Sign up failed",
          description: error.message,
          variant: "destructive"
        });
        throw error;
      }

      toast({
        title: "Sign up successful",
        description: "Please check your email to confirm your account."
      });
    } catch (error: any) {
      console.error("Error during sign up:", error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      
      // Check if using demo credentials
      if (email === "demo@example.com" && password === "demo123") {
        console.log("Demo sign in requested");
        
        const demoUser: DemoUser = {
          uid: "demo-user-id",
          id: "demo-user-id", // Add id for compatibility
          email: "demo@example.com",
          displayName: "Demo User",
          emailVerified: true,
          photoURL: null,
          isAnonymous: false,
          metadata: {
            creationTime: new Date().toISOString(),
            lastSignInTime: new Date().toISOString()
          },
          app_metadata: {},
          user_metadata: {},
          aud: "authenticated",
          created_at: new Date().toISOString()
        };
        
        // Store in localStorage to persist across refreshes
        localStorage.setItem('demoUser', JSON.stringify(demoUser));
        
        // Activate demo mode
        activateDemoMode(demoUser);
        
        toast({
          title: "Welcome to demo mode!",
          description: "You have been signed in with a demo account."
        });
        
        return;
      }
      
      // Regular sign in using Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        toast({
          title: "Sign in failed",
          description: error.message,
          variant: "destructive"
        });
        throw error;
      }

      // Update session and user immediately on successful login
      if (data && data.session) {
        setSession(data.session);
        setCurrentUser(data.user);
      }

      toast({
        title: "Welcome back!",
        description: "You have been signed in successfully."
      });
    } catch (error: any) {
      console.error("Error during sign in:", error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Sign in with Google
  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) {
        toast({
          title: "Google sign in failed",
          description: error.message,
          variant: "destructive"
        });
        throw error;
      }
    } catch (error: any) {
      console.error("Error during Google sign in:", error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      setLoading(true);
      
      // Check if in demo mode
      if (isDemoMode) {
        console.log("Signing out from demo mode");
        localStorage.removeItem('demoUser');
        setCurrentUser(null);
        setProfile(null);
        setIsAdmin(false);
        setIsDemoMode(false);
        
        toast({
          title: "Signed out from demo",
          description: "You have been signed out successfully."
        });
        
        return;
      }
      
      // Firebase sign out
      if (auth.currentUser) {
        await auth.signOut();
      }
      
      // Regular sign out using Supabase
      const { error } = await supabase.auth.signOut();

      if (error) {
        toast({
          title: "Sign out failed",
          description: error.message,
          variant: "destructive"
        });
        throw error;
      }

      // Clear user state immediately on sign out
      setCurrentUser(null);
      setProfile(null);
      setIsAdmin(false);
      setSession(null);
      
      toast({
        title: "Signed out",
        description: "You have been signed out successfully."
      });
    } catch (error: any) {
      console.error("Error during sign out:", error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isDemoMode) {
      // Set up auth state listener
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (event, currentSession) => {
          console.log("Auth state changed:", event, currentSession?.user?.email);
          setSession(currentSession);
          setCurrentUser(currentSession?.user ?? null);
          
          // Defer profile fetch to avoid Supabase recursion issues
          if (currentSession?.user) {
            setTimeout(() => {
              fetchProfile(currentSession.user.id).then(fetchedProfile => {
                if (fetchedProfile) {
                  setProfile(fetchedProfile);
                }
                
                checkAdminRole(currentSession.user.id).then(adminStatus => {
                  setIsAdmin(adminStatus);
                });
              });
            }, 0);
          } else {
            setProfile(null);
            setIsAdmin(false);
          }
        }
      );

      // Check for existing session
      supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
        console.log("Initial session check:", currentSession?.user?.email);
        setSession(currentSession);
        setCurrentUser(currentSession?.user ?? null);
        
        if (currentSession?.user) {
          fetchProfile(currentSession.user.id).then(fetchedProfile => {
            if (fetchedProfile) {
              setProfile(fetchedProfile);
            }
            
            checkAdminRole(currentSession.user.id).then(adminStatus => {
              setIsAdmin(adminStatus);
            });
            
            setLoading(false);
          });
        } else {
          setLoading(false);
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [isDemoMode]);

  const value = {
    currentUser,
    session,
    loading,
    profile,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    refreshProfile,
    updateProfile,
    isAdmin,
    isDemoMode
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
