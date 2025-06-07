import styles from "./PerformancePage.module.css";

function PerformancePage() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Performance</h1>
        <p>Analyze your trading performance and market insights</p>
      </div>

      <div className={styles.content}>
        <div className={styles.comingSoon}>
          <h2>📈 Coming Soon</h2>
          <p>
            Performance analytics will provide detailed insights into your
            trading history, profit/loss, and market trends.
          </p>
        </div>
      </div>
    </div>
  );
}

export default PerformancePage;
