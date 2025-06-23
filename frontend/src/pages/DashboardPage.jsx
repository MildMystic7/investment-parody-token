import { useAuth } from "../hooks/useAuth";
import StatsCard from "../components/StatsCard";
import styles from "./DashboardPage.module.css";
import { TextGenerateEffect } from "../components/ui/text-generate-effect";
import { useState, useEffect } from "react";
import profilePicture from "../assets/Xpfp.jpg";
import { ContainerScroll } from "../components/ui/container-scroll-animation";
import bonk from "../assets/bonk.webp";
import fartcoin from "../assets/fartcoin.webp";
import MemesComponent from "../components/MemesComponent";

function DashboardPage() {
  const { user } = useAuth();
  const [vaultBalance, setVaultBalance] = useState("Loading...");
  const [balanceError, setBalanceError] = useState(null);

  // Fetch wallet balance from backend
  useEffect(() => {
    const fetchWalletBalance = async () => {
      try {
        const response = await fetch(
          "http://localhost:3000/api/wallet/getInfoWallet"
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.success) {
          // Format the balance nicely
          const balance = data.data.balance;
          const formattedBalance = `${balance.toFixed(4)} SOL`;
          setVaultBalance(formattedBalance);
          setBalanceError(null);
        } else {
          setBalanceError(data.error || "Failed to fetch wallet balance");
          setVaultBalance("Error");
        }
      } catch (error) {
        console.error("Error fetching wallet balance:", error);
        setBalanceError(error.message);
        setVaultBalance("Error");
      }
    };

    fetchWalletBalance();
  }, []);

  // Fake data matching the screenshot
  const statsData = [
    {
      title: "Vault Value",
      value: balanceError ? "Error" : vaultBalance,
      trend: "+0.47%",
      trendValue: "+0.47%",
      trendColor: "green",
      icon: "",
    },
    {
      title: "Active Votes",
      value: "487",
      subtitle: "Community votes",
      icon: "",
    },
    {
      title: "Top Voted",
      value: "Bonk",
      trend: "Bonk",
      trendValue: "+3.39%",
      trendColor: "green",
      icon: bonk,
    },
    {
      title: "Least Voted",
      value: "Fartcoin",
      trend: "Fartcoin",
      trendValue: "-0.09%",
      trendColor: "red",
      icon: fartcoin,
    },
  ];

  const words = `The first community driven hedge fund.`;
  const words2 = `We make dumb money, intelligently.`;
  return (
    <div className="flex flex-col bg-black">
      <ContainerScroll
        titleComponent={
          <div className="mb-20">
            <h1 className="text-4xl font-semibold text-white">{words}</h1>
            <p className="text-lg text-white mt-2">{words2}</p>
          </div>
        }
      >
        <div className={styles.container}>
          {/* Stats Cards Row */}
          <div className={styles.statsGrid}>
            {statsData.map((stat, index) => (
              <StatsCard
                key={index}
                title={stat.title}
                value={stat.value}
                subtitle={stat.subtitle}
                icon={stat.icon}
                trend={stat.trend}
                trendValue={stat.trendValue}
                trendColor={stat.trendColor}
              />
            ))}
          </div>
        </div>
      </ContainerScroll>

      <div className={styles.container}>
        {/* Market News Section */}
        <div className={styles.marketNews}>
          <div className={styles.newsHeader}>
            <h3>📰 Market News</h3>
          </div>
          <div className="space-y-8 max-h-[400px] overflow-y-auto">
            {/* Elon Musk Tweet */}
            <div className="bg-[#111116] text-white rounded-xl p-6 border border-gray-800 hover:border-gray-600 transition-colors">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center text-sm font-bold">
                  EM
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-bold">Elon Musk</span>
                    <svg
                      className="w-4 h-4 text-blue-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-gray-400 text-sm">
                      @elonmusk · 14h
                    </span>
                  </div>
                  <div className="text-sm leading-relaxed">
                    <p className="mb-2">Time to drop the really big bomb:</p>
                    <p className="mb-2">
                      <span className="text-blue-400">@realDonaldTrump</span> is
                      in the Epstein files. That is the real reason they have
                      not been made public.
                    </p>
                    <p>Have a nice day, DJT!</p>
                  </div>
                  <div className="flex items-center gap-6 mt-3 text-gray-400 text-sm">
                    <div className="flex items-center gap-1 hover:text-blue-400 cursor-pointer">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                        />
                      </svg>
                      <span>146K</span>
                    </div>
                    <div className="flex items-center gap-1 hover:text-green-400 cursor-pointer">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                        />
                      </svg>
                      <span>308K</span>
                    </div>
                    <div className="flex items-center gap-1 hover:text-red-400 cursor-pointer">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                        />
                      </svg>
                      <span>1M</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* BONK Tweet */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 hover:border-gray-400 transition-colors">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center text-sm font-bold text-white">
                  B
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-bold text-gray-900">BONK</span>
                    <span className="text-gray-500 text-sm">
                      @bonk_inu · May 30
                    </span>
                  </div>
                  <div className="text-sm leading-relaxed text-gray-800">
                    <p className="mb-2">
                      Fun Fact: You can copy your favorite trader aping{" "}
                      <span className="text-blue-500">@bonk_fun</span> coins on{" "}
                      <span className="text-blue-500">@pp_trading</span> and
                      make money with them
                    </p>
                    <p>Here's a link to get started 👇</p>
                  </div>
                  <div className="flex items-center gap-6 mt-3 text-gray-500 text-sm">
                    <div className="flex items-center gap-1 hover:text-gray-700 cursor-pointer">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                        />
                      </svg>
                      <span>33</span>
                    </div>
                    <div className="flex items-center gap-1 hover:text-gray-700 cursor-pointer">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                        />
                      </svg>
                      <span>24</span>
                    </div>
                    <div className="flex items-center gap-1 hover:text-gray-700 cursor-pointer">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                        />
                      </svg>
                      <span>196</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Fartcoin Tweet */}
            <div className="bg-[#111116] text-white rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-colors">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center text-sm font-bold">
                  F
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-bold">Fartcoin</span>
                    <span className="text-gray-400 text-sm">
                      @FartCoinOfSOL · 1h
                    </span>
                  </div>
                  <div className="text-sm leading-relaxed mb-3">
                    <p>fartcoin, lol</p>
                  </div>

                  {/* Quoted Tweet */}
                  <div className="border border-gray-700 rounded-lg p-3 bg-gray-800">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 bg-gray-500 rounded-full flex items-center justify-center text-xs font-bold">
                        C
                      </div>
                      <span className="font-semibold text-sm">
                        Coinbase Traders
                      </span>
                      <svg
                        className="w-3 h-3 text-blue-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-gray-400 text-sm">
                        @coinbasetraders · 11h
                      </span>
                    </div>
                    <p className="text-sm text-gray-300">
                      Hot air rises x.com/coinbaseassets...
                    </p>
                  </div>

                  <div className="flex items-center gap-6 mt-3 text-gray-400 text-sm">
                    <div className="flex items-center gap-1 hover:text-blue-400 cursor-pointer">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                        />
                      </svg>
                      <span>19</span>
                    </div>
                    <div className="flex items-center gap-1 hover:text-green-400 cursor-pointer">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                        />
                      </svg>
                      <span>11</span>
                    </div>
                    <div className="flex items-center gap-1 hover:text-red-400 cursor-pointer">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                        />
                      </svg>
                      <span>101</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <MemesComponent />

        {/* User Info Section */}
        <div className={styles.userSection}>
          <div className={styles.welcomeCard}>
            <div className="flex items-center gap-4 mb-4">
              <img
                src={profilePicture}
                alt="Profile"
                className="w-16 h-16 rounded-full object-cover"
              />
              <div>
                <h3 className="text-xl font-bold">Welcome, @Deathzu_</h3>
                <p className="text-gray-600">X Followers: 1,247</p>
              </div>
            </div>

            <div className={styles.userStats}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <h4 className="font-semibold text-lg">Active Votes</h4>
                  <p className="text-2xl font-bold text-blue-600">2</p>
                  <div className="text-sm text-gray-600 mt-1">
                    <span className="bg-green-100 px-2 py-1 rounded mr-1">
                      Bonk
                    </span>
                    <span className="bg-red-100 px-2 py-1 rounded">
                      Fartcoin
                    </span>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <h4 className="font-semibold text-lg">Total Votes</h4>
                  <p className="text-2xl font-bold text-green-600">12</p>
                  <p className="text-sm text-gray-600">All time</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <h4 className="font-semibold text-lg">Rank</h4>
                  <p className="text-2xl font-bold text-purple-600">#47</p>
                  <p className="text-sm text-gray-600">Community</p>
                </div>
              </div>
            </div>

            {user && (
              <div className="mt-4 p-3 bg-yellow-100 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>Dev Mode:</strong> {user.username} ({user.email})
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
