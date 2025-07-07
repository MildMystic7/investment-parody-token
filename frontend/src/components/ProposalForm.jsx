import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import styles from "./ProposalForm.module.css";
import { Button } from "@/components/ui/button";
import { useSearchParams } from "react-router-dom";

const API_URL = "http://localhost:3001/api";

function ProposalForm({ onProposalCreated }) {
  const { isAuthenticated } = useAuth();
  const [searchParams] = useSearchParams();

  const [formData, setFormData] = useState({
    tokenAddress: "",
    description: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  // Auto-fill form with token address from URL params
  useEffect(() => {
    const tokenAddress = searchParams.get("tokenAddress");
    const tokenName = searchParams.get("tokenName");

    if (tokenAddress) {
      setFormData((prev) => ({
        ...prev,
        tokenAddress: tokenAddress,
        description: tokenName
          ? `I propose we ape into ${tokenName}. This token...`
          : "",
      }));
    }
  }, [searchParams]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setError("You must be logged in to submit a proposal.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccessMessage("");

    try {
      const response = await fetch(`${API_URL}/vote/add-option`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ options: [formData.tokenAddress] }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to submit proposal.");
      }

      setSuccessMessage("Token added to voting successfully!");
      setFormData({ tokenAddress: "", description: "" });
      if (onProposalCreated) {
        onProposalCreated();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className={styles.loginPrompt + " " + styles.loginPromptWarning}>
        <span className={styles.exclamationIcon}>⚠️</span>
        <div>
          <h3>Want to submit a proposal?</h3>
          <p>Please log in to participate in the Degen Council.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.formContainer}>
      <div className={styles.header}>
        <h2>Submit a New Proposal</h2>
        <p>
          Found a promising memecoin? Let the council decide. One proposal per
          day.
        </p>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.inputGroup}>
          <label htmlFor="tokenAddress" className={styles.label}>
            Token Address (Solana Mint)
            {searchParams.get("tokenAddress") && (
              <span className={styles.autoFilled}>
                {" "}
                - Auto-filled from{" "}
                {searchParams.get("tokenName") || "selected token"}
              </span>
            )}
          </label>
          <input
            type="text"
            id="tokenAddress"
            name="tokenAddress"
            value={formData.tokenAddress}
            onChange={handleInputChange}
            placeholder="e.g., DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263"
            className={styles.input}
            required
          />
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="description" className={styles.label}>
            Investment Thesis (Why should we ape in?)
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Tell us why this token will moon. Emojis encouraged."
            className={styles.textarea}
            rows={4}
            required
          />
        </div>

        {error && <p className={styles.errorText}>{error}</p>}
        {successMessage && (
          <p className={styles.successText}>{successMessage}</p>
        )}

        <Button
          type="submit"
          variant="outline"
          disabled={isSubmitting}
          className=""
          style={{
            backgroundColor: "#FF971D",
            color: "white",
            border: "none",
          }}
        >
          {isSubmitting ? "Submitting..." : "↗ Submit Proposal"}
        </Button>
      </form>
    </div>
  );
}

export default ProposalForm;
