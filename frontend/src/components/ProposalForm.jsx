import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import styles from "./ProposalForm.module.css";
import { Button } from "@/components/ui/button";

const API_URL = "http://localhost:3001/api";

function ProposalForm({ onProposalCreated }) {
  const { isAuthenticated } = useAuth();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

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

    const token = localStorage.getItem("authToken");

    try {
      const response = await fetch(`${API_URL}/proposals`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to submit proposal.");
      }

      setSuccessMessage("Proposal submitted successfully!");
      setFormData({ title: "", description: "" });
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
      <div className={styles.loginPrompt}>
        <h3>Want to submit a proposal?</h3>
        <p>Please log in to participate in the Degen Council.</p>
        {/* Optionally, you can add a login button here */}
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
          <label htmlFor="title" className={styles.label}>
            Proposal Title
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="e.g., Ape into BONK"
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
            rows={6}
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
