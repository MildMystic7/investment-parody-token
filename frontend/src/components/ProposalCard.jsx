import { useState } from 'react';
import styles from "./ProposalCard.module.css";

const API_URL = 'http://localhost:3001/api';

function ProposalCard({
  id,
  title,
  proposedBy,
  date,
  description,
  avatar,
  status = "active",
  votesFor,
  votesAgainst,
  userVote, // 'for', 'against', or undefined
  isAuthenticated,
}) {
  const [isVoting, setIsVoting] = useState(false);
  const [voteError, setVoteError] = useState(null);
  // Local vote state for instant UI feedback
  const [localVote, setLocalVote] = useState(null); 

  const totalVotes = votesFor + votesAgainst;
  const percentageFor = totalVotes > 0 ? ((votesFor / totalVotes) * 100).toFixed(0) : 0;
  const percentageAgainst = totalVotes > 0 ? ((votesAgainst / totalVotes) * 100).toFixed(0) : 0;

  const handleVote = async (choice) => {
    if (!isAuthenticated) {
      setVoteError("You must be logged in to vote.");
      return;
    }
    if (userVote || localVote) {
      setVoteError("You have already voted on this proposal.");
      return;
    }
    
    setIsVoting(true);
    setVoteError(null);
    const token = localStorage.getItem('authToken');

    try {
      const response = await fetch(`${API_URL}/vote/${id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ choice }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Failed to cast vote.");
      }
      
      // Give instant feedback
      setLocalVote(choice);
    } catch (err) {
      setVoteError(err.message);
    } finally {
      setIsVoting(false);
    }
  };

  // Determine effective vote state for UI rendering
  const effectiveVote = localVote || userVote;
  const currentVotesFor = votesFor + (localVote === 'for' ? 1 : 0);
  const currentVotesAgainst = votesAgainst + (localVote === 'against' ? 1 : 0);

  return (
    <div className={`${styles.card} ${styles[status]}`}>
      <div className={styles.header}>
        <div className={styles.proposalInfo}>
          <h3 className={styles.title}>{title}</h3>
          <div className={styles.metadata}>
            <div className={styles.proposer}>
              <div className={styles.avatar}>{avatar}</div>
              <span className={styles.proposedBy}>
                Proposed by: <strong>{proposedBy}</strong>
              </span>
            </div>
            <span className={styles.date}>{date}</span>
          </div>
        </div>
      </div>

      <div className={styles.content}>
        <p className={styles.description}>{description}</p>
      </div>

      <div className={styles.footer}>
        <div className={styles.actions}>
          <button 
            className={`${styles.voteButton} ${styles.upvote} ${effectiveVote === 'for' ? styles.voted : ''}`}
            onClick={() => handleVote('for')}
            disabled={isVoting || !isAuthenticated || !!effectiveVote}
          >
            👍 Vote For ({currentVotesFor})
          </button>
          <button 
            className={`${styles.voteButton} ${styles.downvote} ${effectiveVote === 'against' ? styles.voted : ''}`}
            onClick={() => handleVote('against')}
            disabled={isVoting || !isAuthenticated || !!effectiveVote}
          >
            👎 Vote Against ({currentVotesAgainst})
          </button>
        </div>
        {voteError && <p className={styles.errorText}>{voteError}</p>}
      </div>
    </div>
  );
}

export default ProposalCard;
