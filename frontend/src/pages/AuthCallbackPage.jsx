import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/authService";

function AuthCallbackPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const user = authService.receiveTwitterAuth();
    if (user) {
      // On successful auth, redirect to the dashboard.
      // The main AuthProvider will pick up the new user from localStorage on page load.
      window.location.href = "/dashboard";
    } else {
      // Handle failed authentication
      console.error("Authentication failed. Redirecting to login.");
      navigate("/");
    }
  }, [navigate]);

  return (
    <div className="flex items-center justify-center h-screen bg-black">
      <p className="text-white">Authenticating, please wait...</p>
    </div>
  );
}

export default AuthCallbackPage;
