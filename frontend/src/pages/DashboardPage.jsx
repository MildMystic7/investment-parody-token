import { useAuth } from "../hooks/useAuth.jsx";
import StatsCard from "../components/StatsCard";
import styles from "./DashboardPage.module.css";
import { TextGenerateEffect } from "../components/ui/text-generate-effect";
import { useState, useEffect } from "react";
import profilePicture from "../assets/Xpfp.jpg";
import { ContainerScroll } from "../components/ui/container-scroll-animation";
import MemesComponent from "../components/MemesComponent";
import { Skeleton } from "../components/ui/skeleton";

function DashboardPage() {
  const { user } = useAuth();
  const [vaultBalance, setVaultBalance] = useState("Loading...");
  const [balanceError, setBalanceError] = useState(null);
  const [activeVote, setActiveVote] = useState(null);
  const [voteDetails, setVoteDetails] = useState(null);
  const [timeLeft, setTimeLeft] = useState("");
  const [userVoteStats, setUserVoteStats] = useState(null);
  const [userStatsLoading, setUserStatsLoading] = useState(true);
  const [impressiveStats, setImpressiveStats] = useState(null);
  const [impressiveStatsLoading, setImpressiveStatsLoading] = useState(true);

  // Fetch vault balance from backend
  useEffect(() => {
    const fetchVaultBalance = async () => {
      try {
        const response = await fetch("http://localhost:3001/api/vault/balance");

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.success) {
          const totalValue = data.data.totalValueUsd;
          const formattedBalance = `$${totalValue.toFixed(2)}`;
          setVaultBalance(formattedBalance);
          setBalanceError(null);
        } else {
          setBalanceError(data.error || "Failed to fetch vault balance");
          setVaultBalance("Error");
        }
      } catch (error) {
        console.error("Error fetching vault balance:", error);
        setBalanceError(error.message);
        setVaultBalance("Error");
      }
    };

    fetchVaultBalance();
  }, []);

  // Fetch active vote data
  useEffect(() => {
    const fetchActiveVote = async () => {
      try {
        const response = await fetch("http://localhost:3001/api/vote/active");
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setActiveVote(data);

            // Also fetch vote details to get token names
            const detailsResponse = await fetch(
              "http://localhost:3001/api/vote/active/details"
            );
            if (detailsResponse.ok) {
              const detailsData = await detailsResponse.json();
              if (detailsData.success) {
                setVoteDetails(detailsData);
              }
            }
          }
        }
      } catch (error) {
        console.error("Error fetching active vote:", error);
      }
    };

    fetchActiveVote();
  }, []);

  // Countdown timer for voting deadline (2 days)
  useEffect(() => {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 2);

    const updateTimer = () => {
      const now = new Date();
      const difference = targetDate - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor(
          (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );
        const minutes = Math.floor(
          (difference % (1000 * 60 * 60)) / (1000 * 60)
        );

        setTimeLeft(`${days}d ${hours}h ${minutes}m`);
      } else {
        setTimeLeft("Voting ended");
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  // Fetch user voting statistics
  useEffect(() => {
    const fetchUserVoteStats = async () => {
      if (!user) {
        setUserStatsLoading(false);
        return;
      }

      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          setUserStatsLoading(false);
          return;
        }

        const response = await fetch("http://localhost:3001/api/user/votes", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setUserVoteStats(data.userVotes);
          }
        }
      } catch (error) {
        console.error("Error fetching user vote stats:", error);
      } finally {
        setUserStatsLoading(false);
      }
    };

    fetchUserVoteStats();
  }, [user]);

  // Fetch impressive stats
  useEffect(() => {
    const fetchImpressiveStats = async () => {
      try {
        const response = await fetch("http://localhost:3001/api/stats");
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setImpressiveStats(data.data);
          }
        }
      } catch (error) {
        console.error("Error fetching impressive stats:", error);
      } finally {
        setImpressiveStatsLoading(false);
      }
    };

    fetchImpressiveStats();
  }, []);

  // Get top voted option with readable name and image
  const getTopVoted = () => {
    if (!activeVote?.results) return { name: "No votes", votes: 0, image: "" };
    const entries = Object.entries(activeVote.results);
    if (entries.length === 0) return { name: "No votes", votes: 0, image: "" };

    // Calculate total votes for each option (for + against)
    const optionsWithTotalVotes = entries.map(([option, votes]) => ({
      address: option,
      totalVotes: (votes.for || 0) + (votes.against || 0),
      forVotes: votes.for || 0,
      againstVotes: votes.against || 0,
    }));

    // Find the option with most total votes
    const topOption = optionsWithTotalVotes.reduce((a, b) =>
      a.totalVotes > b.totalVotes ? a : b
    );

    // Get readable name and image from vote details
    let readableName = topOption.address;
    let tokenImage = "";

    if (voteDetails?.details) {
      const tokenDetail = voteDetails.details.find(
        (detail) => detail.mint === topOption.address
      );
      if (tokenDetail) {
        // Prioritize name over symbol, but use symbol as fallback
        if (tokenDetail.name) {
          readableName = tokenDetail.name;
        } else if (tokenDetail.symbol) {
          readableName = tokenDetail.symbol;
        }
        // Get the image URL
        tokenImage = tokenDetail.image || "";
      }
    }

    // If we still have the raw address, show loading state
    if (readableName === topOption.address && voteDetails === null) {
      readableName = "Loading...";
    }

    // Truncate long names for display
    const displayName =
      readableName.length > 20
        ? `${readableName.substring(0, 20)}...`
        : readableName;

    return {
      name: displayName,
      votes: topOption.totalVotes,
      fullName: readableName,
      image: tokenImage,
    };
  };

  const getTotalVotes = () => {
    if (!activeVote?.results) return 0;
    return Object.values(activeVote.results).reduce(
      (sum, votes) => sum + (votes.for || 0) + (votes.against || 0),
      0
    );
  };

  const getProposalCount = () => {
    if (!activeVote?.options) return 0;
    return activeVote.options.length;
  };

  const topVoted = getTopVoted();
  const totalVotes = getTotalVotes();
  const proposalCount = getProposalCount();

  // Impressive Numbers Component
  const ImpressiveNumbersSection = () => {
    if (impressiveStatsLoading) {
      return (
        <div className={styles.container}>
          <div className="text-center py-16">
            <h2 className="text-3xl md:text-5xl font-bold text-black mb-6">
              Impressive Numbers That Make No Sense
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed mb-12">
              We've achieved remarkable metrics that we're not entirely sure how
              to interpret, but they look great in presentations.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="bg-white border border-[#FFE8D6] rounded-xl p-8 text-center"
                >
                  <Skeleton className="h-16 w-full mb-4 bg-gray-300" />
                  <Skeleton className="h-6 w-3/4 mx-auto mb-2 bg-gray-300" />
                  <Skeleton className="h-4 w-1/2 mx-auto bg-gray-300" />
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    const formatValue = (value) => {
      if (value >= 1000000) {
        return `$${(value / 1000000).toFixed(1)}M`;
      } else if (value >= 1000) {
        return `$${(value / 1000).toFixed(1)}K`;
      } else {
        return `$${value.toFixed(2)}`;
      }
    };

    return (
      <div className={styles.container}>
        <div className="text-center py-16">
          <h2 className="text-3xl md:text-5xl font-bold text-black mb-6">
            Impressive Numbers That Make No Sense
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed mb-12">
            We've achieved remarkable metrics that we're not entirely sure how
            to interpret, but they look great in presentations.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Portfolio Value */}
            <div className="bg-white border border-[#FFE8D6] rounded-xl p-8 text-center hover:border-[#FF971D] transition-colors">
              <div className="text-4xl md:text-5xl font-bold text-black mb-4">
                {impressiveStats
                  ? formatValue(impressiveStats.totalPortfolioValue)
                  : "$0"}
              </div>
              <h3 className="text-lg font-bold text-black mb-2">
                Total Portfolio Value
              </h3>
              <p className="text-sm text-gray-600">
                Until we ape into something else
              </p>
            </div>

            {/* Token Holders */}
            <div className="bg-white border border-[#FFE8D6] rounded-xl p-8 text-center hover:border-[#FF971D] transition-colors">
              <div className="text-4xl md:text-5xl font-bold text-black mb-4">
                {impressiveStats
                  ? impressiveStats.tokenHolders.toLocaleString()
                  : "69,420"}
              </div>
              <h3 className="text-lg font-bold text-black mb-2">
                Token Holders
              </h3>
              <p className="text-sm text-gray-600">Diamond hands only</p>
            </div>

            {/* Memecoins in Portfolio */}
            <div className="bg-white border border-[#FFE8D6] rounded-xl p-8 text-center hover:border-[#FF971D] transition-colors">
              <div className="text-4xl md:text-5xl font-bold text-black mb-4">
                {impressiveStats ? impressiveStats.memecoinCount : "47"}
              </div>
              <h3 className="text-lg font-bold text-black mb-2">
                Memecoins in Portfolio
              </h3>
              <p className="text-sm text-gray-600">Diversification is key</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const statsData = [
    {
      title: "Vault Value",
      value: balanceError ? "Error" : vaultBalance,
      showSeeMore: true,
      seeMoreText: "View Portfolio",
    },
    {
      title: "Active Votes",
      value: totalVotes,
      icon: "",
      showSeeMore: proposalCount > 0,
      seeMoreText: "See all proposals",
    },
    {
      title: "Top Voted",
      value: topVoted.name,
      icon: topVoted.image,
      showSeeMore: proposalCount > 0,
      seeMoreText: "See all proposals",
    },
    {
      title: "Time Left to Vote",
      value: timeLeft,
      trend: "Voting deadline",
      trendValue: "2 days total",
      trendColor: "orange",
    },
  ];

  const words = `The first community driven hedge fund.`;
  const words2 = `We make dumb money, intelligently.`;
  return (
    <div className="flex flex-col bg-white">
      <ContainerScroll
        titleComponent={
          <div className="mb-20">
            <h1 className="text-2xl md:text-4xl font-semibold text-black">
              {words}
            </h1>
            <p className="text-md md:text-lg text-black mt-2">{words2}</p>
            <div className="flex justify-center mt-8">
              <a
                href="/oakcoin"
                className="px-8 py-4 bg-[#FF971D] text-white font-bold text-lg rounded-full hover:bg-[#e8851a] transition-colors shadow-lg"
              >
                Buy OakCoin
              </a>
            </div>
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
                showSeeMore={stat.showSeeMore}
                seeMoreText={stat.seeMoreText}
              />
            ))}
          </div>
        </div>
      </ContainerScroll>

      {/* Hero Text Section */}
      <div className={styles.container}>
        <div className="text-center py-8">
          <h2 className="text-2xl md:text-4xl font-bold text-black mb-6">
            We combine traditional finance with Degen Energy
          </h2>
          <p className="text-lg md:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Stratton Oakmeme isn't just another memecoin. It's a
            community-driven fund that lets you participate in the future of
            borderline-nonsensical finance.
          </p>
        </div>
      </div>

      {/* Features Section */}
      <div className={styles.container}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Community Governance */}
          <div className="bg-white border border-[#FFE8D6] rounded-xl p-6 hover:border-[#FF971D] transition-colors">
            <div className="w-12 h-12 bg-[#FFE8D6] rounded-lg flex items-center justify-center mb-4">
              <svg
                className="w-6 h-6 text-[#FF971D]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-black mb-3">
              Community Governance
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Vote on which memecoins to ape into next. Democracy, but for
              degenerates.
            </p>
          </div>

          {/* Diversified Portfolio */}
          <div className="bg-white border border-[#FFE8D6] rounded-xl p-6 hover:border-[#FF971D] transition-colors">
            <div className="w-12 h-12 bg-[#FFE8D6] rounded-lg flex items-center justify-center mb-4">
              <svg
                className="w-6 h-6 text-[#FF971D]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-black mb-3">
              Diversified Portfolio
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Why ape into one memecoin when you can ape into ALL of them?
            </p>
          </div>

          {/* Investment Strategy */}
          <div className="bg-white border border-[#FFE8D6] rounded-xl p-6 hover:border-[#FF971D] transition-colors">
            <div className="w-12 h-12 bg-[#FFE8D6] rounded-lg flex items-center justify-center mb-4">
              <svg
                className="w-6 h-6 text-[#FF971D]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-black mb-3">
              Investment Strategy
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Overanalyzed market reports written in MBA-speak explaining why we
              bought dog coins.
            </p>
          </div>

          {/* Fee Distribution */}
          <div className="bg-white border border-[#FFE8D6] rounded-xl p-6 hover:border-[#FF971D] transition-colors">
            <div className="w-12 h-12 bg-[#FFE8D6] rounded-lg flex items-center justify-center mb-4">
              <svg
                className="w-6 h-6 text-[#FF971D]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-black mb-3">
              Fee Distribution
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Creator Rewards fees go straight to the treasury for more ape-ing.
            </p>
          </div>
        </div>
      </div>

      <div className={styles.container}>
        <MemesComponent />
      </div>

      {/* Impressive Numbers Section */}
      <ImpressiveNumbersSection />

      <div className={styles.container}>
        <div className={styles.marketNews}>
          <div className={styles.newsHeader}>
            <h3>📰 Market News</h3>
          </div>
          <div className="space-y-8 max-h-[400px] overflow-y-auto">
            {/* Elon Musk Tweet */}
            <div className="bg-white text-black rounded-xl p-6 border border-[#FFE8D6] hover:border-[#FF971D] transition-colors">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-sm font-bold">
                  EM
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-bold">Elon Musk</span>
                    <svg
                      className="w-4 h-4 text-[#FF971D]"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-black text-sm">@elonmusk · 14h</span>
                  </div>
                  <div className="text-sm leading-relaxed">
                    <p className="mb-2">Time to drop the really big bomb:</p>
                    <p className="mb-2">
                      <span className="text-[#FF971D]">@realDonaldTrump</span>{" "}
                      is in the Epstein files. That is the real reason they have
                      not been made public.
                    </p>
                    <p>Have a nice day, DJT!</p>
                  </div>
                  <div className="flex items-center gap-6 mt-3 text-black text-sm">
                    <div className="flex items-center gap-1 hover:text-[#FF971D] cursor-pointer">
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
                    <div className="flex items-center gap-1 hover:text-[#FF971D] cursor-pointer">
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
                    <div className="flex items-center gap-1 hover:text-red-500 cursor-pointer">
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
            <div className="bg-white border border-[#FFE8D6] rounded-xl p-6 hover:border-[#FF971D] transition-colors">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-sm font-bold text-black">
                  B
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-bold text-black">BONK</span>
                    <span className="text-black text-sm">
                      @bonk_inu · May 30
                    </span>
                  </div>
                  <div className="text-sm leading-relaxed text-black">
                    <p className="mb-2">
                      Fun Fact: You can copy your favorite trader aping{" "}
                      <span className="text-[#FF971D]">@bonk_fun</span> coins on{" "}
                      <span className="text-[#FF971D]">@pp_trading</span> and
                      make money with them
                    </p>
                    <p>Here's a link to get started 👇</p>
                  </div>
                  <div className="flex items-center gap-6 mt-3 text-black text-sm">
                    <div className="flex items-center gap-1 hover:text-[#FF971D] cursor-pointer">
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
                    <div className="flex items-center gap-1 hover:text-[#FF971D] cursor-pointer">
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
                    <div className="flex items-center gap-1 hover:text-red-500 cursor-pointer">
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
            <div className="bg-white text-black rounded-xl p-6 border border-[#FFE8D6] hover:border-[#FF971D] transition-colors">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-sm font-bold">
                  F
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-bold">Fartcoin</span>
                    <span className="text-black text-sm">
                      @FartCoinOfSOL · 1h
                    </span>
                  </div>
                  <div className="text-sm leading-relaxed mb-3">
                    <p>fartcoin, lol</p>
                  </div>

                  {/* Quoted Tweet */}
                  <div className="border border-[#FFE8D6] rounded-lg p-3 bg-[#F9F6F7]">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center text-xs font-bold">
                        C
                      </div>
                      <span className="font-semibold text-sm">
                        Coinbase Traders
                      </span>
                      <svg
                        className="w-3 h-3 text-[#FF971D]"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-black text-sm">
                        @coinbasetraders · 11h
                      </span>
                    </div>
                    <p className="text-sm text-black">
                      Hot air rises x.com/coinbaseassets...
                    </p>
                  </div>

                  <div className="flex items-center gap-6 mt-3 text-black text-sm">
                    <div className="flex items-center gap-1 hover:text-[#FF971D] cursor-pointer">
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
                    <div className="flex items-center gap-1 hover:text-[#FF971D] cursor-pointer">
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
                    <div className="flex items-center gap-1 hover:text-red-500 cursor-pointer">
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
      </div>

      {/* User Info Section */}
      <div className={styles.container}>
        <div className={styles.welcomeCard}>
          <div className="flex items-center gap-4 mb-4">
            <img
              src={user?.photo || profilePicture}
              alt="Profile"
              className="w-16 h-16 rounded-full object-cover"
            />
            <div>
              <h3 className="text-xl font-bold">
                Welcome, @{user?.username || "Guest"}
              </h3>
              <p className="text-black">
                X Followers: {user?.followersCount?.toLocaleString() || "N/A"}
              </p>
            </div>
          </div>

          <div className={styles.userStats}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-[#F9F6F7] p-4 rounded-lg text-center">
                <h4 className="font-semibold text-lg">Active Votes</h4>
                {userStatsLoading ? (
                  <div className="flex items-center justify-center">
                    <Skeleton className="h-8 w-8 rounded-lg bg-gray-300" />
                  </div>
                ) : (
                  <>
                    <p className="text-2xl font-bold text-black">
                      {userVoteStats?.active?.length || 0}
                    </p>
                    <div className="text-sm text-black mt-1">
                      {userVoteStats?.active?.length > 0 ? (
                        userVoteStats.active.map((vote, index) => (
                          <span
                            key={index}
                            className="bg-[#FFE8D6] px-2 py-1 rounded mr-1 mb-1 inline-block"
                            title={`${vote.name} (${vote.vote_type})`}
                          >
                            {vote.name} (
                            {vote.vote_type === "for" ? "👍" : "👎"})
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-500">No active votes</span>
                      )}
                    </div>
                  </>
                )}
              </div>

              <div className="bg-[#F9F6F7] p-4 rounded-lg text-center">
                <h4 className="font-semibold text-lg">Total Votes</h4>
                {userStatsLoading ? (
                  <div className="flex items-center justify-center">
                    <Skeleton className="h-8 w-12 rounded-lg bg-gray-300" />
                  </div>
                ) : (
                  <>
                    <p className="text-2xl font-bold text-black">
                      {userVoteStats?.total || 0}
                    </p>
                    <p className="text-sm text-black">All time</p>
                  </>
                )}
              </div>

              <div className="bg-[#F9F6F7] p-4 rounded-lg text-center">
                <h4 className="font-semibold text-lg">Rank</h4>
                {userStatsLoading ? (
                  <div className="flex items-center justify-center">
                    <Skeleton className="h-8 w-12 rounded-lg bg-gray-300" />
                  </div>
                ) : (
                  <>
                    <p className="text-2xl font-bold text-black">
                      #{userVoteStats?.rank || "N/A"}
                    </p>
                    <p className="text-sm text-black">Community</p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
