import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import ProposalForm from "../components/ProposalForm";
import ProposalFilters from "../components/ProposalFilters";
import ProposalCard from "../components/ProposalCard";
import styles from "./CouncilPage.module.css";
import { Skeleton } from "../components/ui/skeleton"; // Assuming you have a Skeleton component

const API_URL = "http://localhost:3001/api";

function CouncilPage() {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const tokenName = searchParams.get("tokenName");

  const [proposals, setProposals] = useState([]);
  const [userVotes, setUserVotes] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProposals = async () => {
    try {
      const response = await fetch(`${API_URL}/proposals`);
      if (!response.ok) {
        throw new Error("Failed to fetch proposals.");
      }
      const data = await response.json();
      setProposals(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchUserVotes = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) return;
    try {
      const response = await fetch(`${API_URL}/vote/user-votes`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        // Don't throw an error, just log it, as it's not critical for page load
        console.error("Could not fetch user votes.");
        return;
      }
      const data = await response.json();
      setUserVotes(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      await fetchProposals();
      if (isAuthenticated) {
        await fetchUserVotes();
      }
      setIsLoading(false);
    };
    loadData();
  }, [isAuthenticated]);

  // This function will be passed to ProposalForm to refresh data after submission
  const handleProposalCreated = () => {
    fetchProposals();
  };

  const activeProposals = proposals; // In the future, you might filter this

  return (
    <div className={styles.container}>
      {/* Page Header */}
      <div className={styles.pageHeader}>
        <h1>Degen Council</h1>
        <p>
          Vote on which memecoins to ape into next. Your voice matters (kind
          of).
        </p>
      </div>

      {/* Proposal Form */}
      <ProposalForm
        initialTokenName={tokenName || ""}
        onProposalCreated={handleProposalCreated}
      />

      {/* Filters */}
      <ProposalFilters activeCount={activeProposals.length} />

      {/* Proposals Grid */}
      <div className={styles.proposalsGrid}>
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-64 w-full" />
          ))
        ) : error ? (
          <div className={styles.noResults}>
            <p>Error: {error}</p>
          </div>
        ) : activeProposals.length > 0 ? (
          activeProposals.map((proposal) => {
            const votesFor = proposal.Votes.filter(
              (v) => v.choice === "for"
            ).length;
            const votesAgainst = proposal.Votes.filter(
              (v) => v.choice === "against"
            ).length;
            return (
              <ProposalCard
                key={proposal.id}
                id={proposal.id} // Pass id for voting
                title={proposal.title}
                proposedBy={proposal.User?.username || "Unknown"}
                date={new Date(proposal.createdAt).toLocaleDateString()}
                description={proposal.description}
                avatar={proposal.avatar}
                votesFor={votesFor}
                votesAgainst={votesAgainst}
                userVote={userVotes[proposal.id]} // Pass user's vote ('for' or 'against')
                isAuthenticated={isAuthenticated}
              />
            );
          })
        ) : (
          <div className={styles.noResults}>
            <p>No active proposals at the moment.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default CouncilPage;
