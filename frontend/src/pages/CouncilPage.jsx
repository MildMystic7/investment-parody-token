import ProposalForm from "../components/ProposalForm";
import ProposalFilters from "../components/ProposalFilters";
import ProposalCard from "../components/ProposalCard";
import styles from "./CouncilPage.module.css";

function CouncilPage() {
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
      votesFor: 847,
      votesAgainst: 123,
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
      votesFor: 642,
      votesAgainst: 89,
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
      votesFor: 1234,
      votesAgainst: 456,
    },
  ];

  const activeProposals = allProposals.filter((p) => p.status === "active");

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
      <ProposalFilters activeCount={activeProposals.length} />

      {/* Proposals Grid */}
      <div className={styles.proposalsGrid}>
        {activeProposals.length > 0 ? (
          activeProposals.map((proposal) => (
            <ProposalCard
              key={proposal.id}
              title={proposal.title}
              proposedBy={proposal.proposedBy}
              date={proposal.date}
              description={proposal.description}
              avatar={proposal.avatar}
              status={proposal.status}
              votesFor={proposal.votesFor}
              votesAgainst={proposal.votesAgainst}
            />
          ))
        ) : (
          <div className={styles.noResults}>
            <p>No active proposals at the moment.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default CouncilPage;
