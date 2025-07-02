import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import ProposalForm from "../components/ProposalForm";
import ProposalFilters from "../components/ProposalFilters";
import styles from "./CouncilPage.module.css";
import { Skeleton } from "../components/ui/skeleton";
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
      const response = await fetch("http://localhost:3001/api/login", {
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

const API_URL = "http://localhost:3001/api";

function CouncilPage() {
  const { isAuthenticated } = useAuth();
  const [vote, setVote] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [votingOption, setVotingOption] = useState(null);
  const [voteError, setVoteError] = useState(null);
  const [voteSuccess, setVoteSuccess] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const fetchVote = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/vote/active/details`);
      const data = await response.json();
      if (!data.success) throw new Error(data.error || "Failed to fetch vote");
      setVote(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVote();
  }, []);

  const handleVote = async (option) => {
    setVotingOption(option.mint);
    setVoteError(null);
    setVoteSuccess(null);
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`${API_URL}/vote`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ option: option.mint }),
      });
      const data = await response.json();
      if (!data.success) {
        if (data.error === "Invalid or expired token" || data.error === "Authentication required") {
          setShowLoginModal(true);
          return;
        }
        throw new Error(data.error || data.message || "Failed to vote");
      }
      setVoteSuccess("Vote submitted!");
      await fetchVote();
    } catch (err) {
      setVoteError(err.message);
    } finally {
      setVotingOption(null);
    }
  };

  return (
    <div className={styles.container}>
      {showLoginModal && <LoginModal onClose={() => setShowLoginModal(false)} />}
      {/* Page Header */}
      <div className={styles.pageHeader}>
        <h1>Degen Council</h1>
        <p>Vote on which memecoins to ape into next. Your voice matters (kind of).</p>
      </div>
      {/* Proposal Form and Filters (restored) */}
      <ProposalForm />
      <ProposalFilters activeCount={vote?.options?.length || 0} />
      {/* Vote Info Section */}
      <div className={styles.proposalsGrid}>
        {isLoading ? (
          <Skeleton className="h-64 w-full" />
        ) : error ? (
          <div className={styles.noResults}>
            <p>Error: {error}</p>
          </div>
        ) : vote ? (
          <div className={styles.voteInfo}>
            <h2>{vote.title}</h2>
            <table className={styles.voteTable}>
              <thead>
                <tr>
                  <th>#</th>
                  <th>NAME</th>
                  <th>PRICE</th>
                  <th>1H %</th>
                  <th>24H %</th>
                  <th>MARKET CAP</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {vote.details.map((option, idx) => (
                  <tr key={option.mint} className={styles.voteRow}>
                    <td>{idx + 1}</td>
                    <td className={styles.tokenCell}>
                      {option.image ? (
                        <img src={option.image} alt={option.name || option.mint} className={styles.tokenTableImage} />
                      ) : (
                        <div className={styles.tokenTableImagePlaceholder}>🪙</div>
                      )}
                      <div>
                        <div className={styles.tokenNameTable}>{option.name || "Unknown"}</div>
                        <div className={styles.tokenSymbolTable}>{option.symbol}</div>
                      </div>
                    </td>
                    <td>
                      {option.price ? `$${Number(option.price).toLocaleString(undefined, { maximumFractionDigits: 6 })}` : "-"}
                    </td>
                    <td>
                      {option.priceInfo && option.priceInfo["1h"] !== undefined
                        ? `${option.priceInfo["1h"] > 0 ? "+" : ""}${option.priceInfo["1h"].toFixed(2)}%`
                        : "-"}
                    </td>
                    <td>
                      {option.priceInfo && option.priceInfo["24h"] !== undefined
                        ? `${option.priceInfo["24h"] > 0 ? "+" : ""}${option.priceInfo["24h"].toFixed(2)}%`
                        : "-"}
                    </td>
                    <td>
                      {option.marketCap
                        ? `$${Number(option.marketCap).toLocaleString(undefined, { maximumFractionDigits: 2 })}`
                        : "-"}
                    </td>
                    <td>
                      {isAuthenticated && (
                        <button
                          className={styles.voteButton}
                          onClick={() => handleVote(option)}
                          disabled={votingOption === option.mint}
                        >
                          {votingOption === option.mint ? "Voting..." : "Vote"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {voteError && !showLoginModal && <p className={styles.errorText}>{voteError}</p>}
            {voteSuccess && <p className={styles.successText}>{voteSuccess}</p>}
          </div>
        ) : (
          <div className={styles.noResults}>
            <p>No active vote at the moment.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default CouncilPage;
