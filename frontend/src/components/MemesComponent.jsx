import React from "react";
import styles from "./MemesComponent.module.css";

const MemesComponent = () => {
  // Fake data for the dashboard boxes

  // Fake data for the memecoins table
  const memecoinsData = [
    {
      rank: 8,
      name: "Dogecoin",
      symbol: "DOGE",
      price: "$0.2047",
      change1h: "-0.18%",
      change24h: "-8.59%",
      change7d: "-11.53%",
      marketCap: "$30,608,922,311",
      volume: "$2,165,051,431",
      supply: "149.47B DOGE",
      isNegative1h: true,
      isNegative24h: true,
      isNegative7d: true,
    },
    {
      rank: 19,
      name: "Shiba Inu",
      symbol: "SHIB",
      price: "$0.00001335",
      change1h: "+0.17%",
      change24h: "-7.07%",
      change7d: "-9.32%",
      marketCap: "$7,868,819,401",
      volume: "$306,627,772",
      supply: "589.24T SHIB",
      isNegative1h: false,
      isNegative24h: true,
      isNegative7d: true,
    },
    {
      rank: 25,
      name: "Pepe",
      symbol: "PEPE",
      price: "$0.00001301",
      change1h: "-0.55%",
      change24h: "-8.68%",
      change7d: "-10.68%",
      marketCap: "$5,473,769,637",
      volume: "$1,653,905,077",
      supply: "420.68T PEPE",
      isNegative1h: true,
      isNegative24h: true,
      isNegative7d: true,
    },
    {
      rank: 42,
      name: "OFFICIAL TRUMP",
      symbol: "TRUMP",
      price: "$11.47",
      change1h: "-0.52%",
      change24h: "-6.93%",
      change7d: "-13.84%",
      marketCap: "$2,294,064,485",
      volume: "$781,243,447",
      supply: "199.99M TRUMP",
      isNegative1h: true,
      isNegative24h: true,
      isNegative7d: true,
    },
    {
      rank: 60,
      name: "Bonk",
      symbol: "BONK",
      price: "$0.00001766",
      change1h: "-0.77%",
      change24h: "-11.08%",
      change7d: "-20.65%",
      marketCap: "$1,402,647,628",
      volume: "$315,945,671",
      supply: "79.38T BONK",
      isNegative1h: true,
      isNegative24h: true,
      isNegative7d: true,
    },
    {
      rank: 68,
      name: "Fartcoin",
      symbol: "FARTCOIN",
      price: "$1.13",
      change1h: "-0.74%",
      change24h: "-11.06%",
      change7d: "-25.82%",
      marketCap: "$1,135,661,351",
      volume: "$226,135,852",
      supply: "999.99M FARTCOIN",
      isNegative1h: true,
      isNegative24h: true,
      isNegative7d: true,
    },
    {
      rank: 74,
      name: "SPX6900",
      symbol: "SPX",
      price: "$1.12",
      change1h: "-2.77%",
      change24h: "-3.50%",
      change7d: "+23.56%",
      marketCap: "$1,045,232,940",
      volume: "$79,814,489",
      supply: "930.99M SPX",
      isNegative1h: true,
      isNegative24h: true,
      isNegative7d: false,
    },
    {
      rank: 75,
      name: "dogwifhat",
      symbol: "WIF",
      price: "$1.00",
      change1h: "-1.70%",
      change24h: "-8.73%",
      change7d: "-13.10%",
      marketCap: "$1,003,095,488",
      volume: "$341,014,803",
      supply: "998.84M WIF",
      isNegative1h: true,
      isNegative24h: true,
      isNegative7d: true,
    },
    {
      rank: 79,
      name: "FLOKI",
      symbol: "FLOKI",
      price: "$0.00009206",
      change1h: "-0.79%",
      change24h: "-9.44%",
      change7d: "-11.97%",
      marketCap: "$886,060,405",
      volume: "$142,822,864",
      supply: "9.62T FLOKI",
      isNegative1h: true,
      isNegative24h: true,
      isNegative7d: true,
    },
    {
      rank: 97,
      name: "Pudgy Penguins",
      symbol: "PENGU",
      price: "$0.01107",
      change1h: "-0.48%",
      change24h: "-9.85%",
      change7d: "-17.32%",
      marketCap: "$695,984,090",
      volume: "$122,604,762",
      supply: "62.86B PENGU",
      isNegative1h: true,
      isNegative24h: true,
      isNegative7d: true,
    },
  ];

  return (
    <>
      {/* Memecoins Table */}
      <div className={styles.tableContainer}>
        <div className={styles.tableHeader}>
          <div className={styles.tableCell}>#</div>
          <div className={styles.tableCell}>Name</div>
          <div className={styles.tableCell}>Price</div>
          <div className={styles.tableCell}>1h %</div>
          <div className={styles.tableCell}>24h %</div>
          <div className={styles.tableCell}>7d %</div>
          <div className={styles.tableCell}>Market Cap 💡</div>
          <div className={styles.tableCell}>Vote</div>
        </div>

        {memecoinsData.map((coin) => (
          <div key={coin.rank} className={styles.tableRow}>
            <div className={styles.tableCell}>
              <span className={styles.rank}>{coin.rank}</span>
            </div>
            <div className={styles.tableCell}>
              <div className={styles.coinInfo}>
                <div className={styles.coinIcon}>
                  <img
                    src={`https://s2.coinmarketcap.com/static/img/coins/64x64/29743.png`}
                    alt={coin.name}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src =
                        "https://s2.coinmarketcap.com/static/img/coins/64x64/1.png";
                    }}
                  />
                </div>
                <div className={styles.coinDetails}>
                  <span className={styles.coinName}>{coin.name}</span>
                  <span className={styles.coinSymbol}>{coin.symbol}</span>
                </div>
              </div>
            </div>
            <div className={styles.tableCell}>
              <span className={styles.price}>{coin.price}</span>
            </div>
            <div className={styles.tableCell}>
              <span
                className={`${styles.change} ${
                  coin.isNegative1h ? styles.negative : styles.positive
                }`}
              >
                {coin.change1h}
              </span>
            </div>
            <div className={styles.tableCell}>
              <span
                className={`${styles.change} ${
                  coin.isNegative24h ? styles.negative : styles.positive
                }`}
              >
                {coin.change24h}
              </span>
            </div>
            <div className={styles.tableCell}>
              <span
                className={`${styles.change} ${
                  coin.isNegative7d ? styles.negative : styles.positive
                }`}
              >
                {coin.change7d}
              </span>
            </div>
            <div className={styles.tableCell}>
              <span className={styles.marketCap}>{coin.marketCap}</span>
            </div>
            <div className={styles.tableCell}>
              <button className={styles.buyButton}>
                <a href="/council">Vote</a>
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default MemesComponent;
