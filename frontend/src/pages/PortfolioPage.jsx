import { ChartAreaInteractive } from "../components/ChartAreaInteractive";
import styles from "./PortfolioPage.module.css";
import { useState, useEffect } from "react";

function PortfolioPage() {
  const [portfolioData, setPortfolioData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          "http://ec2-54-85-73-173.compute-1.amazonaws.com/api/portfolio"
        );
        const data = await response.json();

        if (data.success) {
          setPortfolioData(data.data);
        } else {
          setError(data.error || "Failed to fetch portfolio");
        }
      } catch (err) {
        setError("Failed to connect to server");
        console.error("Portfolio fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolio();
  }, []);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatLargeNumber = (value) => {
    if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
    if (value >= 1e3) return `$${(value / 1e3).toFixed(1)}K`;
    return formatCurrency(value);
  };
  return (
    <div>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>Portfolio</h1>
          <p>Track our memecoin investments and performance</p>
        </div>

        <div className={styles.content}>
          <ChartAreaInteractive />
        </div>
      </div>

      <div className="mt-5 max-w-[1200px] mx-auto w-full mb-10 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Balance */}
        <div className="md:col-span-1">
          <h2 className="text-2xl font-bold text-black mb-6">Balance</h2>
          <div className="bg-[#F9F6F7] p-6 rounded-lg border border-[#FFE8D6] shadow-sm">
            {loading ? (
              <div className="animate-pulse">
                <div className="h-8 bg-gray-300 rounded mb-2"></div>
                <div className="h-4 bg-gray-300 rounded w-1/2"></div>
              </div>
            ) : error ? (
              <div>
                <p className="text-2xl font-bold text-red-500">Error</p>
                <p className="text-sm text-red-500 mt-2">{error}</p>
              </div>
            ) : (
              <div>
                <p className="text-4xl font-bold text-black">
                  {formatCurrency(portfolioData?.totalValueUsd || 0)}
                </p>
                <p className="text-sm text-black mt-2">Total Portfolio Value</p>
                <p className="text-xs text-gray-600 mt-1">
                  Wallet: {portfolioData?.wallet?.slice(0, 8)}...
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Holdings */}
        <div className="md:col-span-2">
          <h2 className="text-2xl font-bold text-black mb-6">Total Holdings</h2>
          <div className="space-y-4">
            {loading ? (
              // Loading skeleton
              Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="bg-[#F9F6F7] p-6 rounded-lg border border-[#FFE8D6] shadow-sm animate-pulse"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                      <div>
                        <div className="h-4 bg-gray-300 rounded w-20 mb-2"></div>
                        <div className="h-3 bg-gray-300 rounded w-16"></div>
                      </div>
                    </div>
                    <div>
                      <div className="h-4 bg-gray-300 rounded w-16 mb-2"></div>
                      <div className="h-3 bg-gray-300 rounded w-12"></div>
                    </div>
                  </div>
                </div>
              ))
            ) : error ? (
              <div className="bg-red-50 p-6 rounded-lg border border-red-200">
                <p className="text-red-600">Failed to load holdings: {error}</p>
              </div>
            ) : portfolioData?.tokens?.length > 0 ? (
              portfolioData.tokens.map((token, index) => (
                <div
                  key={token.mint || index}
                  className="bg-[#F9F6F7] p-6 rounded-lg border border-[#FFE8D6] shadow-sm flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    {token.icon ? (
                      <img
                        src={token.icon}
                        alt={token.name}
                        className="w-10 h-10 rounded-full"
                        onError={(e) => {
                          e.target.src =
                            "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiNFNUU3RUIiLz4KPHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4PSI4IiB5PSI4Ij4KPHBhdGggZD0iTTEyIDJMMTMuMDkgOC4yNkwyMCAxMEwxMy4wOSAxNS43NEwxMiAyMkwxMC45MSAxNS43NEw0IDEwTDEwLjkxIDguMjZMMTIgMloiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+Cjwvc3ZnPgo=";
                        }}
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold text-gray-600">
                          {token.symbol?.slice(0, 2) || "??"}
                        </span>
                      </div>
                    )}
                    <div>
                      <h3 className="text-lg font-bold text-black">
                        {token.name || token.symbol || "Unknown Token"}
                      </h3>
                      <p className="text-sm text-black">
                        {token.amount
                          ? `${token.amount.toFixed(4)} ${token.symbol}`
                          : "N/A"}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-black">
                      {formatCurrency(token.valueUsd || 0)}
                    </p>
                    <p className="text-sm text-black text-right">Total Value</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-[#F9F6F7] p-6 rounded-lg border border-[#FFE8D6] text-center">
                <p className="text-gray-600">No tokens found in portfolio</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PortfolioPage;
