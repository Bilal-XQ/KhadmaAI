
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export default function AuthCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get code and next_url from URL
        const params = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = params.get("access_token");

        if (!accessToken) {
          // Try to get session another way
          const { data, error: sessionError } = await supabase.auth.getSession();
          
          if (sessionError) {
            throw sessionError;
          }
          
          if (data.session) {
            toast({
              title: "Authentication successful",
              description: "You have been successfully authenticated",
            });
            // We have a session, redirect to dashboard
            navigate("/dashboard");
            return;
          } else {
            throw new Error("No access token found in URL and no active session.");
          }
        }

        toast({
          title: "Authentication successful",
          description: "You have been successfully authenticated",
        });
        // Redirect to dashboard
        navigate("/dashboard");
      } catch (error: any) {
        console.error("Error in auth callback:", error);
        setError(error.message);
        toast({
          title: "Authentication Error",
          description: error.message,
          variant: "destructive"
        });
        // Redirect to login after a delay if there's an error
        setTimeout(() => navigate("/login"), 2000);
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="max-w-md w-full text-center">
        <h1 className="text-2xl font-bold text-khadma-darkBlue mb-4">
          {error ? "Authentication Error" : "Authenticating..."}
        </h1>
        {error ? (
          <p className="text-red-600 mb-4">{error}</p>
        ) : (
          <p className="text-gray-600 mb-4">Please wait while we complete your authentication.</p>
        )}
        <div className="animate-pulse flex justify-center items-center">
          <div className="w-3 h-3 bg-blue-300 rounded-full mx-1"></div>
          <div className="w-3 h-3 bg-blue-500 rounded-full mx-1 animate-delay-200"></div>
          <div className="w-3 h-3 bg-blue-700 rounded-full mx-1 animate-delay-400"></div>
        </div>
      </div>
    </div>
  );
}
