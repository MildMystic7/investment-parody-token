import styles from "./VotingCandidate.module.css";

function VotingCandidate({
  symbol,
  company,
  price,
  change,
  changePercent,
  volume,
  marketCap,
  updated,
  isActive = false,
  chartData = [],
}) {
  const isPositive = change >= 0;

  return (
    <div className={`${styles.candidate} ${isActive ? styles.active : ""}`}>
      <div className={styles.header}>
        <div className={styles.stockInfo}>
          <h3 className={styles.symbol}>{symbol}</h3>
          <p className={styles.company}>{company}</p>
        </div>
        <div className={styles.chartIcon}>📊</div>
      </div>

      <div className={styles.priceSection}>
        <div className={styles.price}>${price}</div>
        <div
          className={`${styles.change} ${
            isPositive ? styles.positive : styles.negative
          }`}
        >
          <span className={styles.changeIcon}>{isPositive ? "↗" : "↘"}</span>
          <span>
            ${Math.abs(change).toFixed(2)} ({changePercent}%)
          </span>
        </div>
      </div>

      <div className={styles.miniChart}>
        <div className={styles.chartPlaceholder}>
          {/* Simple chart representation */}
          <div
            className={`${styles.chartLine} ${
              isPositive ? styles.chartPositive : styles.chartNegative
            }`}
          ></div>
        </div>
      </div>

      <div className={styles.details}>
        <div className={styles.detailRow}>
          <span className={styles.label}>Volume:</span>
          <span className={styles.value}>${volume}</span>
        </div>
        <div className={styles.detailRow}>
          <span className={styles.label}>Mkt Cap:</span>
          <span className={styles.value}>${marketCap}</span>
        </div>
        <div className={styles.detailRow}>
          <span className={styles.label}>Updated:</span>
          <span className={styles.value}>{updated}</span>
        </div>
      </div>
    </div>
  );
}

export default VotingCandidate;
