import styles from "./StatsCard.module.css";
import { useNavigate } from "react-router-dom";

function StatsCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendValue,
  trendColor = "green",
  showSeeMore = false,
  seeMoreText = "See more",
}) {
  const navigate = useNavigate();

  const handleSeeMore = () => {
    if (title === "Active Votes" || title === "Top Voted") {
      navigate("/council");
    }
  };

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h3 className={styles.title}>{title}</h3>
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        </div>
        {icon && <img src={icon} alt={title} className={styles.icon} />}
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
        {showSeeMore && (
          <button className={styles.seeMoreButton} onClick={handleSeeMore}>
            {seeMoreText} →
          </button>
        )}
      </div>
    </div>
  );
}

export default StatsCard;
