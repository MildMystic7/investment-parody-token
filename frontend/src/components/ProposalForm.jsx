import { useState } from "react";
import styles from "./ProposalForm.module.css";
import { Button } from "@/components/ui/button";

function ProposalForm() {
  const [formData, setFormData] = useState({
    tokenName: "",
    contractAddress: "",
    investmentThesis: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Handle form submission
    console.log("Proposal submitted:", formData);
    // Reset form
    setFormData({
      tokenName: "",
      contractAddress: "",
      investmentThesis: "",
    });
  };

  return (
    <div className={styles.formContainer}>
      <div className={styles.header}>
        <h2>Submit a New Proposal</h2>
        <p>
          Found a promising memecoin? Submit a proposal to the Degen Council for
          voting. You need at least 1,000 $DEGEN tokens to create a proposal.
        </p>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formRow}>
          <div className={styles.inputGroup}>
            <label htmlFor="tokenName" className={styles.label}>
              Token Name
            </label>
            <input
              type="text"
              id="tokenName"
              name="tokenName"
              value={formData.tokenName}
              onChange={handleInputChange}
              placeholder="e.g., PEPE, DOGE, SHIB..."
              className={styles.input}
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="contractAddress" className={styles.label}>
              Token Contract Address
            </label>
            <input
              type="text"
              id="contractAddress"
              name="contractAddress"
              value={formData.contractAddress}
              onChange={handleInputChange}
              placeholder="0x..."
              className={styles.input}
              required
            />
          </div>
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="investmentThesis" className={styles.label}>
            Investment Thesis (Why should we ape in?)
          </label>
          <textarea
            id="investmentThesis"
            name="investmentThesis"
            value={formData.investmentThesis}
            onChange={handleInputChange}
            placeholder="Tell us why this token will moon. Emojis encouraged."
            className={styles.textarea}
            rows={6}
            required
          />
        </div>

        <Button variant="outline" className="">
          ↗ Submit Proposal
        </Button>
      </form>
    </div>
  );
}

export default ProposalForm;
