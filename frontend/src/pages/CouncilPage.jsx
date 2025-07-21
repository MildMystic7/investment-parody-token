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
      const response = await fetch(
        "http://ec2-54-85-73-173.compute-1.amazonaws.com/api/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        }
      );
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
        <button className={styles.modalClose} onClick={onClose}>
          ×
        </button>
        <h2>Login</h2>
        <button
          className={styles.xButton}
          onClick={() => authService.loginWithTwitter()}
        >
          <span className={styles.xIcon}>𝕏</span> Continue with X
        </button>
        <div className={styles.orLine}>
          <span>or</span>
        </div>
        <form onSubmit={handleEmailLogin} className={styles.emailForm}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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

const API_URL = "http://ec2-54-85-73-173.compute-1.amazonaws.com/api";

function CouncilPage() {
  const { isAuthenticated } = useAuth();
  const [vote, setVote] = useState(null);
  const [voteResults, setVoteResults] = useState(null);
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
      // Fetch both vote details and vote results
      const [detailsResponse, resultsResponse] = await Promise.all([
        fetch(`${API_URL}/vote/active/details`),
        fetch(`${API_URL}/vote/active`),
      ]);

      const detailsData = await detailsResponse.json();
      const resultsData = await resultsResponse.json();

      if (!detailsData.success)
        throw new Error(detailsData.error || "Failed to fetch vote details");
      if (!resultsData.success)
        throw new Error(resultsData.error || "Failed to fetch vote results");

      setVote(detailsData);
      setVoteResults(resultsData.results);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVote();
  }, []);

  const handleVote = async (option, voteType) => {
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
        body: JSON.stringify({ option: option.mint, vote_type: voteType }),
      });
      const data = await response.json();
      if (!data.success) {
        if (
          data.error === "Invalid or expired token" ||
          data.error === "Authentication required"
        ) {
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
      {showLoginModal && (
        <LoginModal onClose={() => setShowLoginModal(false)} />
      )}
      {/* Page Header */}
      <div className={styles.pageHeader}>
        <h1>Degen Council</h1>
        <p>
          Vote on which memecoins to ape into next. Your voice matters (kind
          of).
        </p>
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
          <>
            <h2 className={styles.voteTitle}>{vote.title}</h2>
            {vote.details.map((option) => (
              <div key={option.mint} className={styles.proposalCard}>
                <div className={styles.proposalHeader}>
                  <div className={styles.tokenInfo}>
                    {option.image ? (
                      <img
                        src={option.image}
                        alt={option.name || option.mint}
                        className={styles.tokenImage}
                      />
                    ) : (
                      <div className={styles.tokenImagePlaceholder}>🪙</div>
                    )}
                    <h3 className={styles.tokenName}>
                      {option.name || "Unknown Token"}
                    </h3>
                  </div>
                  <div className={styles.proposalMeta}>
                    <div className={styles.proposedBy}>
                      Proposed by:
                      <a
                        href={`https://x.com/SolanaMaximalist`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.xLink}
                      >
                        SolanaMaximalist
                      </a>
                    </div>
                    <div className={styles.date}>Apr 20, 2025</div>
                  </div>
                </div>

                <div className={styles.contractAddress}>
                  <span className={styles.caLabel}>CA:</span>
                  <a
                    href={`https://solscan.io/token/${option.mint}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.caLink}
                  >
                    {option.mint}
                  </a>
                </div>

                <div className={styles.investmentThesis}>
                  <p>
                    {option.name} is the Solana memecoin with massive potential.
                    With the Solana ecosystem growing rapidly, {option.name}{" "}
                    could be the next 10x play. I propose we allocate 5% of our
                    treasury to acquire a position.
                  </p>
                </div>

                <div className={styles.voteActions}>
                  <div className={styles.voteStats}>
                    <span className={styles.voteCount}>
                      For: {voteResults?.[option.mint]?.for || 0}
                    </span>
                    <span className={styles.voteCount}>
                      Against: {voteResults?.[option.mint]?.against || 0}
                    </span>
                  </div>
                  {isAuthenticated && (
                    <div className={styles.voteButtons}>
                      <button
                        className={`${styles.voteButton} ${styles.apeInButton}`}
                        onClick={() => handleVote(option, "for")}
                        disabled={votingOption === option.mint}
                      >
                        {votingOption === option.mint ? "Voting..." : "Ape In"}
                      </button>
                      <button
                        className={`${styles.voteButton} ${styles.passButton}`}
                        onClick={() => handleVote(option, "against")}
                        disabled={votingOption === option.mint}
                      >
                        Pass
                      </button>
                    </div>
                  )}
                </div>

                <div className={styles.proposalStatus}>
                  <span className={styles.statusLabel}>Status: Active</span>
                  <span className={styles.timeRemaining}>
                    Time remaining: 1d 12h remaining
                  </span>
                </div>
              </div>
            ))}
            {voteError && !showLoginModal && (
              <p className={styles.errorText}>{voteError}</p>
            )}
            {voteSuccess && <p className={styles.successText}>{voteSuccess}</p>}
          </>
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
