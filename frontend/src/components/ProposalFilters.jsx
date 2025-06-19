import styles from "./ProposalFilters.module.css";

function ProposalFilters({ activeCount = 6 }) {
  return (
    <div className={styles.filtersContainer}>
      <div className={styles.header}>
        <h2 className={styles.title}>
          Active Proposals <span className={styles.count}>{activeCount}</span>
        </h2>
      </div>
    </div>
  );
}

export default ProposalFilters;
