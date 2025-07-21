import { useState } from "react";
import styles from "../pages/CouncilPage.module.css";
import { authService } from "../services/authService";

function LoginModal({ onClose }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      // Call backend login endpoint
      const response = await fetch("http://ec2-54-85-73-173.compute-1.amazonaws.com/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!data.success) throw new Error(data.error || "Login failed");
      localStorage.setItem("authToken", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      onClose();
      window.location.reload();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <button className={styles.modalClose} onClick={onClose}>×</button>
        <h2>Login</h2>
        <button className={styles.xButton} onClick={() => authService.loginWithTwitter()}>
          <span className={styles.xIcon}>𝕏</span> Continue with X
        </button>
        <div className={styles.orLine}><span>or</span></div>
        <form onSubmit={handleEmailLogin} className={styles.emailForm}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? "Entrando..." : "Entrar"}
          </button>
          {error && <p className={styles.errorText}>{error}</p>}
        </form>
      </div>
    </div>
  );
}

export default LoginModal; 