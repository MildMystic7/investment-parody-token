import { useNavigate } from "react-router-dom";
import { AuroraBackground } from "../components/ui/aurora-background";
import { useAuth } from "../hooks/useAuth";

function NewLoginPage() {
  const navigate = useNavigate();
  const { loginDevelopmentMode, loginWithTwitter } = useAuth();

  const handleContinue = async () => {
    // For development, we can still use the mock login
    await loginDevelopmentMode();
    navigate("/dashboard");
  };

  const handleLoginWithX = async () => {
    // This will redirect the user
    await loginWithTwitter();
  };

  return (
    <AuroraBackground>
      <div className="relative z-20 flex flex-col items-center justify-center h-full px-4 text-center">
        <div className="text-3xl md:text-5xl font-bold text-white">
          STRATTON OAKMONT INC.
        </div>

        <div className="mt-8">
          <h1 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400">
            The first Community-Driven Parody Token
          </h1>
          <h2 className="mt-4 font-normal text-base md:text-lg text-neutral-300 max-w-lg mx-auto">
            We make dumb money, intelligently.
          </h2>
          <p className="mt-2 font-normal text-sm md:text-base text-neutral-400 max-w-md mx-auto">
            Synergistic meme synergies
          </p>
        </div>

        <div className="mt-8 flex flex-col items-center gap-4">
          <button
            className="px-6 py-2 bg-[#FF971D] text-white rounded-full font-medium cursor-pointer"
            onClick={handleContinue}
          >
            Start Trading (Dev)
          </button>

          <button
            className="px-4 py-2 rounded-full border border-white/20 text-white bg-black flex items-center gap-2 cursor-pointer"
            onClick={handleLoginWithX}
          >
            <span className="text-lg">𝕏</span>
            Continue with X
          </button>
        </div>

        <p className="mt-8 text-xs text-neutral-500">
          Select a login method to continue.
        </p>
      </div>
    </AuroraBackground>
  );
}

export default NewLoginPage;
