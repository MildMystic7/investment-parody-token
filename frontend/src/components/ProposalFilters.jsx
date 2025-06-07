import { useState } from "react";
import styles from "./ProposalFilters.module.css";

function ProposalFilters({ onFilterChange, onSearchChange, activeCount = 6 }) {
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const filters = [
    { key: "all", label: "All", icon: "🔵" },
    { key: "active", label: "Active", icon: "🟢" },
    { key: "passed", label: "Passed", icon: "✅" },
    { key: "rejected", label: "Rejected", icon: "❌" },
  ];

  const handleFilterClick = (filterKey) => {
    setActiveFilter(filterKey);
    onFilterChange(filterKey);
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    onSearchChange(value);
  };

  return (
    <div className={styles.filtersContainer}>
      <div className={styles.header}>
        <h2 className={styles.title}>
          Active Proposals <span className={styles.count}>{activeCount}</span>
        </h2>
      </div>

      <div className={styles.controls}>
        <div className={styles.searchContainer}>
          <input
            type="text"
            placeholder="Search proposals..."
            value={searchTerm}
            onChange={handleSearchChange}
            className={styles.searchInput}
          />
          <span className={styles.searchIcon}>🔍</span>
        </div>

        <div className={styles.filterButtons}>
          {filters.map((filter) => (
            <button
              key={filter.key}
              className={`${styles.filterButton} ${
                activeFilter === filter.key ? styles.active : ""
              }`}
              onClick={() => handleFilterClick(filter.key)}
            >
              <span className={styles.filterIcon}>{filter.icon}</span>
              {filter.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ProposalFilters;
