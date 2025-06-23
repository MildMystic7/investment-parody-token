import styles from "./ProposalCard.module.css";

function ProposalCard({
  title,
  proposedBy,
  date,
  description,
  avatar,
  status = "active",
  votesFor,
  votesAgainst,
}) {
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
          <button className={`${styles.voteButton} ${styles.upvote}`}>
            👍 Vote For ({votesFor})
          </button>
          <button className={`${styles.voteButton} ${styles.downvote}`}>
            👎 Vote Against ({votesAgainst})
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProposalCard;
