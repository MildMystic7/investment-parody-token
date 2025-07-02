import { useNavigate } from "react-router-dom";
import { AuroraBackground } from "../components/ui/aurora-background";
import { useAuth } from "../hooks/useAuth";
import { useState } from "react";
import { authService } from "../services/authService";

function NewLoginPage() {
  const navigate = useNavigate();
  const { loginWithTwitter } = useAuth();
  const user = authService.getCurrentUser();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showRegister, setShowRegister] = useState(false);
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerConfirm, setRegisterConfirm] = useState("");
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerError, setRegisterError] = useState(null);

  const handleLoginWithX = async () => {
    await loginWithTwitter();
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const response = await fetch("http://localhost:3001/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!data.success) throw new Error(data.error || "Login failed");
      localStorage.setItem("authToken", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setRegisterError(null);
    if (registerPassword !== registerConfirm) {
      setRegisterError("Passwords do not match");
      return;
    }
    setRegisterLoading(true);
    try {
      const response = await fetch("http://localhost:3001/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: registerEmail,
          password: registerPassword,
        }),
      });
      const data = await response.json();
      if (!data.success) throw new Error(data.error || "Registration failed");
      localStorage.setItem("authToken", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      navigate("/dashboard");
    } catch (err) {
      setRegisterError(err.message);
    } finally {
      setRegisterLoading(false);
    }
  };

  if (user) {
    // Show avatar, username, continue and logout button if logged in
    return (
      <AuroraBackground>
        <div className="relative z-20 flex flex-col items-center justify-center h-full px-4 text-center">
          <div className="text-2xl md:text-4xl font-bold text-white">
            STRATTON OAKMONT INC.
          </div>
          <div className="mt-6">
            <h1 className="text-3xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400">
              The first Community-Driven Parody Token
            </h1>
            <h2 className="mt-3 font-normal text-sm md:text-base text-neutral-300 max-w-lg mx-auto">
              We make dumb money, intelligently.
            </h2>
            <p className="mt-2 font-normal text-xs md:text-sm text-neutral-400 max-w-md mx-auto">
              Synergistic meme synergies
            </p>
          </div>
          <div className="flex flex-col items-center gap-4 mt-8">
            <div className="w-20 h-20 rounded-full bg-[#FFE8D6] flex items-center justify-center text-4xl font-bold text-[#FF971D] border-2 border-[#FF971D]">
              {user.photo ? (
                <img
                  src={user.photo}
                  alt="avatar"
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span role="img" aria-label="avatar">
                  👤
                </span>
              )}
            </div>
            <div className="text-xl font-bold text-white mt-2">
              {user.username}
            </div>
            <button
              className="mt-4 px-6 py-2 bg-[#FF971D] text-white rounded-full font-medium cursor-pointer"
              onClick={() => navigate("/dashboard")}
            >
              Continue
            </button>
            <button
              className="mt-2 px-6 py-2 bg-[#222] text-white rounded-full font-medium cursor-pointer border border-[#FF971D]"
              onClick={() => {
                authService.logout();
                window.location.reload();
              }}
            >
              Logout
            </button>
          </div>
        </div>
      </AuroraBackground>
    );
  }

  return (
    <AuroraBackground>
      <div className="relative z-20 flex flex-col items-center justify-center h-full px-4 text-center">
        <div className="text-2xl md:text-4xl font-bold text-white">
          STRATTON OAKMONT INC.
        </div>

        <div className="mt-6">
          <h1 className="text-3xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400">
            The first Community-Driven Parody Token
          </h1>
          <h2 className="mt-3 font-normal text-sm md:text-base text-neutral-300 max-w-lg mx-auto">
            We make dumb money, intelligently.
          </h2>
          <p className="mt-2 font-normal text-xs md:text-sm text-neutral-400 max-w-md mx-auto">
            Synergistic meme synergies
          </p>
        </div>

        <div className="mt-6 flex flex-col items-center gap-4 w-full max-w-xs">
          {!showRegister && (
            <>
              <button
                className="px-4 py-2 rounded-full border border-white/20 text-white bg-black flex items-center gap-2 cursor-pointer w-full justify-center text-base font-bold"
                onClick={handleLoginWithX}
              >
                <span className="text-xl">𝕏</span>
                Continue with X
              </button>
              <div className="flex items-center w-full my-2">
                <div className="flex-1 border-t border-neutral-400"></div>
                <span className="mx-3 text-neutral-400 font-semibold text-sm">
                  or
                </span>
                <div className="flex-1 border-t border-neutral-400"></div>
              </div>
              <button
                className="px-4 py-2 rounded-full border border-[#FF971D] text-[#FF971D] bg-white flex items-center gap-2 cursor-pointer w-full justify-center text-base font-bold mt-2"
                onClick={() => navigate("/dashboard")}
              >
                Continue without login
              </button>
            </>
          )}
          {!showRegister ? (
            <>
              <form
                onSubmit={handleEmailLogin}
                className="flex flex-col gap-3 w-full"
              >
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="rounded-lg px-4 py-2 border border-[#FFE8D6] bg-white text-black focus:outline-none focus:ring-2 focus:ring-[#FF971D]"
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="rounded-lg px-4 py-2 border border-[#FFE8D6] bg-white text-black focus:outline-none focus:ring-2 focus:ring-[#FF971D]"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-[#FF971D] text-white rounded-lg py-2 font-bold mt-2 disabled:bg-[#ffd7a3]"
                >
                  {loading ? "Entrando..." : "Entrar"}
                </button>
                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
              </form>
              <button
                className="mt-2 text-[#FF971D] underline text-sm font-semibold"
                onClick={() => setShowRegister(true)}
              >
                Create account
              </button>
            </>
          ) : (
            <form
              onSubmit={handleRegister}
              className="flex flex-col gap-3 w-full"
            >
              <input
                type="email"
                placeholder="Email"
                value={registerEmail}
                onChange={(e) => setRegisterEmail(e.target.value)}
                required
                className="rounded-lg px-4 py-2 border border-[#FFE8D6] bg-white text-black focus:outline-none focus:ring-2 focus:ring-[#FF971D]"
              />
              <input
                type="password"
                placeholder="Password"
                value={registerPassword}
                onChange={(e) => setRegisterPassword(e.target.value)}
                required
                className="rounded-lg px-4 py-2 border border-[#FFE8D6] bg-white text-black focus:outline-none focus:ring-2 focus:ring-[#FF971D]"
              />
              <input
                type="password"
                placeholder="Confirm Password"
                value={registerConfirm}
                onChange={(e) => setRegisterConfirm(e.target.value)}
                required
                className="rounded-lg px-4 py-2 border border-[#FFE8D6] bg-white text-black focus:outline-none focus:ring-2 focus:ring-[#FF971D]"
              />
              <button
                type="submit"
                disabled={registerLoading}
                className="bg-[#FF971D] text-white rounded-lg py-2 font-bold mt-2 disabled:bg-[#ffd7a3]"
              >
                {registerLoading ? "Creating..." : "Create account"}
              </button>
              {registerError && (
                <p className="text-red-500 text-sm mt-2">{registerError}</p>
              )}
              <button
                className="mt-2 text-[#FF971D] underline text-sm font-semibold"
                type="button"
                onClick={() => setShowRegister(false)}
              >
                Back to login
              </button>
            </form>
          )}
        </div>

        <p className="mt-6 text-xs text-neutral-500">
          {!showRegister
            ? "Select a login method to continue."
            : "Create your account to join the community."}
        </p>
      </div>
    </AuroraBackground>
  );
}

export default NewLoginPage;
