import React, { useState } from "react";
import styles from "./MemesPage.module.css";

const MemesPage = () => {
  const [timeFilter, setTimeFilter] = useState("24h");

  // Fake data for the dashboard boxes
  const mostVisitedData = [
    {
      rank: 1,
      name: "KAKA",
      price: "$0.005892",
      change: "-22.59%",
      isNegative: true,
    },
    {
      rank: 2,
      name: "ZEUS",
      price: "$0.08829",
      change: "-30.98%",
      isNegative: true,
    },
    {
      rank: 3,
      name: "TIBBIR",
      price: "$0.0001008",
      change: "+239.26%",
      isNegative: false,
    },
    {
      rank: 4,
      name: "BNBXBT",
      price: "$0.005499",
      change: "+706.08%",
      isNegative: false,
    },
    {
      rank: 5,
      name: "DUMP",
      price: "$0.01071",
      change: "-6.81%",
      isNegative: true,
    },
  ];

  const topGainersData = [
    { name: "WAP", change: "+282.68%", color: "#10b981" },
    { name: "CZGOAT", change: "+99.88%", color: "#10b981" },
    { name: "BUBB", change: "+76.91%", color: "#10b981" },
  ];

  const marketCapData = {
    value: "$64.22B",
    change: "+8.13%",
    volume: "$9.93B",
    volumeChange: "+19.71%",
  };

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
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>
          Top Memes Tokens by Market Capitalization
        </h1>
        <p className={styles.subtitle}>
          This page lists the top meme coins and tokens. These projects are
          listed by market capitalization with the largest first and then
          descending in order.
        </p>
      </div>

      {/* Dashboard Boxes */}
      <div className={styles.dashboardBoxes}>
        {/* Most Visited */}
        <div className={styles.dashboardBox}>
          <div className={styles.boxHeader}>
            <h3 className={styles.boxTitle}>Most Visited</h3>
            <div className={styles.boxIcons}>
              <span>👁️</span>
              <span>⏰</span>
            </div>
          </div>
          <div className={styles.boxContent}>
            {mostVisitedData.map((item) => (
              <div key={item.rank} className={styles.listItem}>
                <div className={styles.tokenInfo}>
                  <span className={styles.rank}>{item.rank}</span>
                  <div className={styles.tokenIcon}>🪙</div>
                  <span className={styles.tokenName}>{item.name}</span>
                </div>
                <div className={styles.priceInfo}>
                  <span className={styles.price}>{item.price}</span>
                  <span
                    className={`${styles.change} ${
                      item.isNegative ? styles.negative : styles.positive
                    }`}
                  >
                    {item.change}
                  </span>
                </div>
                <div className={styles.miniChart}>
                  <svg viewBox="0 0 60 20" className={styles.miniChartSvg}>
                    <path
                      d={`M0,15 Q15,${Math.random() * 10 + 5} 30,${
                        Math.random() * 10 + 5
                      } Q45,${Math.random() * 10 + 5} 60,${
                        Math.random() * 10 + 5
                      }`}
                      stroke={item.isNegative ? "#ef4444" : "#10b981"}
                      strokeWidth="1.5"
                      fill="none"
                    />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Gainers */}
        <div className={styles.dashboardBox}>
          <div className={styles.boxHeader}>
            <h3 className={styles.boxTitle}>Top Gainers</h3>
            <div className={styles.timeFilters}>
              <button
                className={`${styles.timeFilter} ${
                  timeFilter === "24h" ? styles.active : ""
                }`}
                onClick={() => setTimeFilter("24h")}
              >
                24h
              </button>
              <button
                className={`${styles.timeFilter} ${
                  timeFilter === "30d" ? styles.active : ""
                }`}
                onClick={() => setTimeFilter("30d")}
              >
                30d
              </button>
              <button
                className={`${styles.timeFilter} ${
                  timeFilter === "All" ? styles.active : ""
                }`}
                onClick={() => setTimeFilter("All")}
              >
                All
              </button>
            </div>
          </div>
          <div className={styles.boxContent}>
            <div className={styles.chartPlaceholder}>
              <div className={styles.chartLines}>
                {topGainersData.map((item, index) => (
                  <div key={index} className={styles.chartLine}>
                    <span
                      className={styles.tokenDot}
                      style={{ backgroundColor: item.color }}
                    ></span>
                    <span className={styles.tokenLabel}>{item.name}</span>
                    <span className={styles.tokenGain}>{item.change}</span>
                  </div>
                ))}
              </div>
              <div className={styles.chartArea}>
                <svg className={styles.chartSvg} viewBox="0 0 400 200">
                  <path
                    d="M0,150 Q100,120 200,100 T400,80"
                    stroke="#10b981"
                    strokeWidth="2"
                    fill="none"
                  />
                  <path
                    d="M0,160 Q100,140 200,130 T400,110"
                    stroke="#f59e0b"
                    strokeWidth="2"
                    fill="none"
                  />
                  <path
                    d="M0,170 Q100,150 200,140 T400,120"
                    stroke="#3b82f6"
                    strokeWidth="2"
                    fill="none"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Market Cap */}
        <div className={styles.dashboardBox}>
          <div className={styles.boxHeader}>
            <h3 className={styles.boxTitle}>Market Cap</h3>
            <div className={styles.boxIcons}>
              <span>📈</span>
              <span>🔗</span>
            </div>
            <div className={styles.timeFilters}>
              <button className={`${styles.timeFilter} ${styles.active}`}>
                24h
              </button>
              <button className={styles.timeFilter}>30d</button>
              <button className={styles.timeFilter}>All</button>
            </div>
          </div>
          <div className={styles.boxContent}>
            <div className={styles.marketCapInfo}>
              <div className={styles.marketCapMain}>
                <span className={styles.marketCapLabel}>● Market Cap</span>
                <span className={styles.marketCapValue}>
                  {marketCapData.value}
                </span>
                <span className={styles.positive}>{marketCapData.change}</span>
              </div>
              <div className={styles.volumeInfo}>
                <span className={styles.volumeLabel}>Volume</span>
                <span className={styles.volumeValue}>
                  {marketCapData.volume}
                </span>
                <span className={styles.positive}>
                  {marketCapData.volumeChange}
                </span>
              </div>
            </div>
            <div className={styles.chartArea}>
              <svg className={styles.chartSvg} viewBox="0 0 400 150">
                <path
                  d="M0,100 Q50,80 100,70 Q150,60 200,65 Q250,70 300,60 Q350,50 400,45"
                  stroke="#ef4444"
                  strokeWidth="2"
                  fill="none"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

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
          <div className={styles.tableCell}>Volume(24h) 💡</div>
          <div className={styles.tableCell}>Circulating Supply 💡</div>
          <div className={styles.tableCell}>Last 7 Days</div>
        </div>

        {memecoinsData.map((coin) => (
          <div key={coin.rank} className={styles.tableRow}>
            <div className={styles.tableCell}>
              <span className={styles.rank}>{coin.rank}</span>
            </div>
            <div className={styles.tableCell}>
              <div className={styles.coinInfo}>
                <div className={styles.coinIcon}>🪙</div>
                <div className={styles.coinDetails}>
                  <span className={styles.coinName}>{coin.name}</span>
                  <span className={styles.coinSymbol}>{coin.symbol}</span>
                </div>
                <button className={styles.buyButton}>
                  <a href="/council">Vote</a>
                </button>
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
              <span className={styles.volume}>{coin.volume}</span>
            </div>
            <div className={styles.tableCell}>
              <span className={styles.supply}>{coin.supply}</span>
            </div>
            <div className={styles.tableCell}>
              <div className={styles.miniChart}>
                <svg viewBox="0 0 100 30" className={styles.miniChartSvg}>
                  <path
                    d={`M0,25 Q25,${Math.random() * 20 + 5} 50,${
                      Math.random() * 20 + 5
                    } Q75,${Math.random() * 20 + 5} 100,${
                      Math.random() * 20 + 5
                    }`}
                    stroke={coin.isNegative7d ? "#ef4444" : "#10b981"}
                    strokeWidth="1.5"
                    fill="none"
                  />
                </svg>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MemesPage;
