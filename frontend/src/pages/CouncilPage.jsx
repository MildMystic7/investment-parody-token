import { useState, useEffect } from "react";
import ProposalForm from "../components/ProposalForm";
import ProposalFilters from "../components/ProposalFilters";
import ProposalCard from "../components/ProposalCard";
import styles from "./CouncilPage.module.css";

function CouncilPage() {
  const [filteredProposals, setFilteredProposals] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  // Fake proposal data matching the screenshot
  const allProposals = [
    {
      id: 1,
      title: "Should we ape into BONK?",
      proposedBy: "SolanaMaximalist",
      date: "Apr 20, 2025",
      description:
        "BONK is the Solana memecoin with massive community support and growing adoption. The meme potential is still massive.",
      avatar: "🐕",
      status: "active",
    },
    {
      id: 2,
      title: "Add more PEPE to the treasury",
      proposedBy: "PepeWhale",
      date: "Apr 19, 2025",
      description:
        "PEPE has been one of our best performing assets. The meme potential is still massive.",
      avatar: "🐸",
      status: "active",
    },
    {
      id: 3,
      title: "Diversify into WIF token",
      proposedBy: "DogenRich",
      date: "Apr 18, 2025",
      description:
        "Dog wif hat ($WIF) is taking over Twitter and has massive meme potential. The Solana ecosystem is booming and this could be our next 100x.",
      avatar: "🐕",
      status: "active",
    },
    {
      id: 4,
      title: "Should we invest in SHIB ecosystem?",
      proposedBy: "ShibArmy",
      date: "Apr 17, 2025",
      description:
        "Shiba Inu has evolved beyond just a meme coin with Shibarium and DeFi integrations. Time to ape in! 🚀",
      avatar: "🐕",
      status: "passed",
    },
    {
      id: 5,
      title: "Allocate funds to DOGE",
      proposedBy: "ElonFan",
      date: "Apr 16, 2025",
      description:
        "The original meme coin is making a comeback. With Elon's continued support and X integration rumors, this could moon! 🌙",
      avatar: "🐕",
      status: "passed",
    },
    {
      id: 6,
      title: "Invest in SafeMoon revival",
      proposedBy: "MoonBoy",
      date: "Apr 15, 2025",
      description:
        "SafeMoon is attempting a comeback with new tokenomics. High risk, high reward play for the degen council.",
      avatar: "🌙",
      status: "rejected",
    },
  ];

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
    filterProposals(filter, searchTerm);
  };

  const handleSearchChange = (search) => {
    setSearchTerm(search);
    filterProposals(activeFilter, search);
  };

  const filterProposals = (filter, search) => {
    let filtered = allProposals;

    // Filter by status
    if (filter !== "all") {
      filtered = filtered.filter((proposal) => proposal.status === filter);
    }

    // Filter by search term
    if (search) {
      filtered = filtered.filter(
        (proposal) =>
          proposal.title.toLowerCase().includes(search.toLowerCase()) ||
          proposal.description.toLowerCase().includes(search.toLowerCase()) ||
          proposal.proposedBy.toLowerCase().includes(search.toLowerCase())
      );
    }

    setFilteredProposals(filtered);
  };

  // Initialize with all proposals
  useEffect(() => {
    setFilteredProposals(allProposals);
  }, []);

  const activeProposalsCount = allProposals.filter(
    (p) => p.status === "active"
  ).length;

  return (
    <div className={styles.container}>
      {/* Page Header */}
      <div className={styles.pageHeader}>
        <h1>Degen Council</h1>
        <p>
          Vote on which memecoins to ape into next. Your voice matters (kind
          of).
        </p>
      </div>

      {/* Proposal Form */}
      <ProposalForm />

      {/* Filters */}
      <ProposalFilters
        onFilterChange={handleFilterChange}
        onSearchChange={handleSearchChange}
        activeCount={activeProposalsCount}
      />

      {/* Proposals Grid */}
      <div className={styles.proposalsGrid}>
        {filteredProposals.length > 0 ? (
          filteredProposals.map((proposal) => (
            <ProposalCard
              key={proposal.id}
              title={proposal.title}
              proposedBy={proposal.proposedBy}
              date={proposal.date}
              description={proposal.description}
              avatar={proposal.avatar}
              status={proposal.status}
            />
          ))
        ) : (
          <div className={styles.noResults}>
            <p>No proposals found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default CouncilPage;
