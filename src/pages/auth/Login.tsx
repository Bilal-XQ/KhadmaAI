
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { signInWithGoogle as firebaseSignInWithGoogle, signInWithEmail } from "../../services/firebase";

const Login = () => {
  const { t } = useTranslation("common");
  const { currentUser, signIn } = useAuth();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState("demo@example.com"); // Pre-filled with demo email
  const [password, setPassword] = useState("demo123"); // Pre-filled with demo password
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Redirect if already logged in
  useEffect(() => {
    if (currentUser) {
      console.log("User is already logged in, redirecting to dashboard");
      navigate("/dashboard");
    }
  }, [currentUser, navigate]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!email || !password) {
      setError(t("errors.required"));
      return;
    }
    
    try {
      setLoading(true);
      
      // Use the AuthContext signIn function first
      await signIn(email, password);
      
      toast({
        title: "Login successful",
        description: "Welcome back!"
      });
      
      // Force navigation to dashboard regardless of auth context update
      console.log("Login successful, navigating to dashboard");
      navigate("/dashboard", { replace: true });
    } catch (err: any) {
      console.error("Error during sign in with AuthContext:", err);
      
      try {
        // Fall back to Firebase if AuthContext fails
        console.log("Falling back to Firebase authentication");
        const { user, error: firebaseError } = await signInWithEmail(email, password);
        
        if (firebaseError) {
          throw firebaseError;
        }
        
        if (user) {
          toast({
            title: "Login successful",
            description: "Welcome back!"
          });
          
          // Force navigation to dashboard
          navigate("/dashboard", { replace: true });
        } else {
          throw new Error("Failed to sign in - no user returned");
        }
      } catch (fbErr: any) {
        console.error("Error during sign in with Firebase:", fbErr);
        setError(fbErr.message || "Failed to sign in");
        toast({
          title: "Login failed",
          description: fbErr.message || "An error occurred during login",
          variant: "destructive"
        });
      }
    } finally {
      setLoading(false);
    }
  };
  
  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setError("");
      
      console.log("Signing in with Google using Firebase");
      const { user, error: firebaseError } = await firebaseSignInWithGoogle();
      
      if (firebaseError) {
        console.error("Firebase Google sign-in failed:", firebaseError);
        throw firebaseError;
      }
      
      if (user) {
        toast({
          title: "Google sign in successful",
          description: "You have been successfully signed in with Google."
        });
        
        // Navigate to dashboard after successful sign-in
        navigate("/dashboard", { replace: true });
      } else {
        throw new Error("Failed to sign in with Google - no user returned");
      }
    } catch (err: any) {
      console.error("Error during Google sign in:", err);
      setError(err.message || "Failed to sign in with Google");
      toast({
        title: "Google sign in failed",
        description: err.message || "An error occurred during Google sign in",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Demo login shortcut
  const handleDemoLogin = () => {
    setEmail("demo@example.com");
    setPassword("demo123");
    
    // Submit the form with demo credentials
    handleSubmit(new Event('submit') as any);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-lg shadow-md">
        <div>
          <h2 className="text-center text-3xl font-bold text-khadma-darkBlue">
            {t("auth.login")}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {t("auth.noAccount")}{" "}
            <Link
              to="/signup"
              className="font-medium text-khadma-blue hover:text-khadma-blue/90"
            >
              {t("auth.signup")}
            </Link>
          </p>
          <div className="mt-3 text-center">
            <div className="bg-blue-100 text-blue-700 p-3 rounded-md text-sm">
              <strong>Demo Credentials</strong><br/>
              Email: demo@example.com<br/>
              Password: demo123
            </div>
          </div>
        </div>
        
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <Label htmlFor="email-address">{t("auth.email")}</Label>
              <Input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="password">{t("auth.password")}</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          <div className="flex items-center justify-end">
            <div className="text-sm">
              <Link
                to="/forgot-password"
                className="font-medium text-khadma-blue hover:text-khadma-blue/90"
              >
                {t("auth.forgotPassword")}
              </Link>
            </div>
          </div>

          <div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-khadma-blue hover:bg-khadma-blue/90"
            >
              {loading ? "Loading..." : t("auth.login")}
            </Button>
          </div>
          
          <div>
            <Button
              type="button"
              onClick={handleDemoLogin}
              disabled={loading}
              className="w-full bg-green-500 hover:bg-green-600 text-white"
            >
              Quick Demo Login
            </Button>
          </div>
        </form>
        
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">
                Or continue with
              </span>
            </div>
          </div>

          <div className="mt-6">
            <Button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              variant="outline"
              className="w-full border-gray-300"
            >
              <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              {t("auth.continueWithGoogle")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
