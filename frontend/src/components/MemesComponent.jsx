import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import styles from "./MemesComponent.module.css";

// Helper function to format large numbers for display
const formatNumber = (num) => {
  if (num === null || num === undefined) return "N/A";
  if (num >= 1_000_000_000) {
    return `$${(num / 1_000_000_000).toFixed(2)}B`;
  }
  if (num >= 1_000_000) {
    return `$${(num / 1_000_000).toFixed(2)}M`;
  }
  if (num >= 1_000) {
    return `$${(num / 1_000).toFixed(2)}K`;
  }
  return `$${Number(num).toFixed(2)}`;
};

// Helper to format price, especially for very small numbers
const formatPrice = (priceStr) => {
  const price = parseFloat(priceStr);
  if (isNaN(price)) return "N/A";
  if (price < 0.000001) {
    return `$${price.toExponential(2)}`;
  }
  return `$${price.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  })}`;
};

const MemesComponent = () => {
  const [memecoinsData, setMemecoinsData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTrendingCoins = async () => {
      try {
        const response = await fetch(
          "http://ec2-54-85-73-173.compute-1.amazonaws.com/api/dex/trending"
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        const pairs = data.pairs || [];

        // Filter for valid pairs and take the top 20
        const top20 = pairs
          .filter((p) => p.priceUsd && p.baseToken)
          .slice(0, 20);

        setMemecoinsData(top20);
      } catch (e) {
        console.error("Failed to fetch trending coins:", e);
        setError(e.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrendingCoins();
  }, []);

  if (isLoading) {
    return (
      <div style={{ textAlign: "center", padding: "2rem" }}>
        Loading trending coins...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: "center", padding: "2rem", color: "red" }}>
        Error: {error}
      </div>
    );
  }

  return (
    <>
      {/* Memecoins Table */}
      <div className={styles.header}>
        <h2 className={styles.title}>Top Trending Meme Coins by Market Cap</h2>
        <p className={styles.subtitle}>
          Showing {memecoinsData.length} trending tokens. Scroll to see more!
        </p>
      </div>
      <div className={styles.tableContainer}>
        <div className={styles.tableHeader}>
          <div className={styles.tableCell}>#</div>
          <div className={styles.tableCell}>Name</div>
          <div className={styles.tableCell}></div> {/* Empty for button */}
          <div className={styles.tableCell}>Price</div>
          <div className={`${styles.tableCell} ${styles.hideOnMobile}`}>
            1h %
          </div>
          <div className={`${styles.tableCell} ${styles.hideOnMobile}`}>
            24h %
          </div>
          <div className={`${styles.tableCell} ${styles.hideOnMobile}`}>
            Market Cap 💡
          </div>
        </div>

        <div className={styles.scrollableRows}>
          {memecoinsData.map((coin, index) => {
            const change1h = coin.priceChange?.h1;
            const change24h = coin.priceChange?.h24;

            return (
              <div key={coin.pairAddress || index} className={styles.tableRow}>
                <div className={styles.tableCell}>
                  <span className={styles.rank}>{index + 1}</span>
                </div>
                <div className={styles.tableCell}>
                  <div className={styles.coinInfo}>
                    <div className={styles.coinIcon}>
                      <img
                        src={coin.info?.imageUrl}
                        alt={coin.baseToken.name}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src =
                            "https://s2.coinmarketcap.com/static/img/coins/64x64/1.png";
                        }}
                      />
                    </div>
                    <div className={styles.coinDetails}>
                      <span className={styles.coinName}>
                        {coin.baseToken.name}
                      </span>
                      <span className={styles.coinSymbol}>
                        {coin.baseToken.symbol}
                      </span>
                    </div>
                  </div>
                </div>
                <div className={styles.tableCell}>
                  <Link
                    to={`/council?tokenName=${encodeURIComponent(
                      coin.baseToken.name
                    )}&tokenAddress=${encodeURIComponent(
                      coin.baseToken.address
                    )}`}
                  >
                    <button className={styles.buyButton}>Vote</button>
                  </Link>
                </div>
                <div className={styles.tableCell}>
                  <span className={styles.price}>
                    {formatPrice(coin.priceUsd)}
                  </span>
                </div>
                <div className={`${styles.tableCell} ${styles.hideOnMobile}`}>
                  <span
                    className={`${styles.change} ${
                      change1h < 0 ? styles.negative : styles.positive
                    }`}
                  >
                    {change1h?.toFixed(2) ?? "N/A"}%
                  </span>
                </div>
                <div className={`${styles.tableCell} ${styles.hideOnMobile}`}>
                  <span
                    className={`${styles.change} ${
                      change24h < 0 ? styles.negative : styles.positive
                    }`}
                  >
                    {change24h?.toFixed(2) ?? "N/A"}%
                  </span>
                </div>
                <div className={`${styles.tableCell} ${styles.hideOnMobile}`}>
                  <span className={styles.marketCap}>
                    {formatNumber(coin.fdv)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default MemesComponent;
