import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import styles from "./LoginPage.module.css";
import { motion } from "framer-motion";
import bonk from "../assets/bonk.webp";

function LoginPage() {
  const navigate = useNavigate();
  const { loginDevelopmentMode, isLoading, error, isAuthenticated } = useAuth();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  const handleContinue = async () => {
    try {
      await loginDevelopmentMode();
      console.log("Login successful - navigating to dashboard");
      navigate("/dashboard");
    } catch (err) {
      console.error("Login failed:", err);
    }
  };

  return (
    <div className={styles.container}>
      {/* Animated Light Waves Background */}
      <div className={styles.lightWaves}>
        <div className={styles.wave1}></div>
        <div className={styles.wave2}></div>
        <div className={styles.wave3}></div>
      </div>

      {/* Company Name in Top Left */}
      <div className={styles.topLeft}>
        <div className={styles.companyName}>STRATTON</div>
        <div className={styles.companySubtitle}>OAKMONT INC.</div>
      </div>

      {/* Main Content Centered */}
      <motion.div
        initial={{ opacity: 0.0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{
          delay: 0.3,
          duration: 0.8,
          ease: "easeInOut",
        }}
        className={styles.mainContent}
      >
        {/* Logo/Image */}
        <div className={styles.logoSection}>
          <div className={styles.logo}>
            <img
              src={bonk}
              alt="Stratton Oakmont Inc."
              className={styles.logoImage}
            />
          </div>
        </div>

        {/* Text Content */}
        <div className={styles.textContent}>
          <h1 className={styles.title}>
            The first Community-Driven Parody Token
          </h1>
          <h2 className={styles.subtitle}>
            We make dumb money, intelligently.
          </h2>
          <p className={styles.tagline}>Synergistic meme synergies</p>
        </div>

        {/* Buttons Section */}
        <div className={styles.buttonsSection}>
          {error && <div className={styles.error}>{error}</div>}

          <button
            className={styles.continueButton}
            onClick={handleContinue}
            disabled={isLoading}
          >
            {isLoading ? "Connecting..." : "Start Trading"}
          </button>

          <button className={styles.twitterButton} disabled>
            <span className={styles.twitterIcon}>𝕏</span>
            Continue with X (Coming Soon)
          </button>
        </div>

        {/* Footer Note */}
        <p className={styles.footerNote}>
          Development Mode - Twitter auth will be implemented later
        </p>
      </motion.div>
    </div>
  );
}

export default LoginPage;
