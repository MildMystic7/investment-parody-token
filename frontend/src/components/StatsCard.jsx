import styles from "./StatsCard.module.css";

function StatsCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendValue,
  trendColor = "green",
}) {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h3 className={styles.title}>{title}</h3>
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        </div>
        {icon && <div className={styles.icon}>{icon}</div>}
      </div>

      <div className={styles.content}>
        <div className={styles.value}>{value}</div>
        {trend && (
          <div className={`${styles.trend} ${styles[trendColor]}`}>
            <span className={styles.trendIcon}>
              {trendColor === "green" ? "↗" : "↘"}
            </span>
            <span className={styles.trendValue}>{trendValue}</span>
            {trend && <span className={styles.trendText}>{trend}</span>}
          </div>
        )}
      </div>
    </div>
  );
}

export default StatsCard;
