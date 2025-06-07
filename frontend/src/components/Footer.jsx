import React, { useState } from "react";
import styles from "./Footer.module.css";

const Footer = () => {
  const [email, setEmail] = useState("");

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    // Handle newsletter subscription
    console.log("Newsletter subscription:", email);
    setEmail("");
  };

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        {/* Top Section with Newsletter */}
        <div className={styles.topSection}>
          {/* Stay in touch */}
          <div className={styles.contactSection}>
            <h2 className={styles.sectionTitle}>Stay in touch</h2>
            <p className={styles.contactText}>
              Announcements can be found in our blog. Press contact:{" "}
              <a
                href="mailto:media@strattonoakmeme.com"
                className={styles.emailLink}
              >
                media@strattonoakmeme.com
              </a>
            </p>
            <div className={styles.socialLinks}>
              <a href="#" className={styles.socialLink}>
                <span>🐦</span>
              </a>
              <a href="#" className={styles.socialLink}>
                <span>📘</span>
              </a>
              <a href="#" className={styles.socialLink}>
                <span>📷</span>
              </a>
            </div>
          </div>

          {/* Newsletter */}
          <div className={styles.newsletterSection}>
            <h2 className={styles.sectionTitle}>Subscribe to our newsletter</h2>
            <p className={styles.newsletterDescription}>
              New memecoins supported, blog updates and exclusive offers
              directly in your inbox
            </p>
            <form
              onSubmit={handleNewsletterSubmit}
              className={styles.newsletterForm}
            >
              <div className={styles.inputContainer}>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className={styles.emailInput}
                  required
                />
                <button type="submit" className={styles.submitButton}>
                  Subscribe to newsletter
                </button>
              </div>
            </form>
            <div className={styles.privacyText}>
              <p>
                Your email address will only be used to send you our newsletter,
                as well as updates and offers. You can unsubscribe at any time
                using the link included in the newsletter.{" "}
                <a href="#" className={styles.privacyLink}>
                  Learn more about how we manage your data and your rights.
                </a>
              </p>
              <p>
                This site is protected by reCAPTCHA and the Google{" "}
                <a href="#" className={styles.privacyLink}>
                  Privacy Policy
                </a>{" "}
                and{" "}
                <a href="#" className={styles.privacyLink}>
                  Terms of Service
                </a>{" "}
                apply.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Section with Links */}
        <div className={styles.bottomSection}>
          {/* Company Logo and Info */}
          <div className={styles.companySection}>
            <div className={styles.logo}>
              <span className={styles.logoText}>STRATTON OAKMEME</span>
            </div>
            <div className={styles.languageSelector}>
              <button className={styles.languageButton}>ENGLISH ▼</button>
            </div>
            <div className={styles.companyInfo}>
              <p>
                Copyright © Stratton Oakmeme SAS. All rights reserved. Stratton,
                Oakmeme Stax, Stratton Nano S, Stratton Vault, Memes are
                trademarks owned by Stratton Oakmeme SAS.
              </p>
              <p>106 rue du Temple, 75003 Paris, France</p>
              <p>Payment methods</p>
            </div>
          </div>

          {/* Products */}
          <div className={styles.linkSection}>
            <h3 className={styles.linkSectionTitle}>Services</h3>
            <ul className={styles.linkList}>
              <li>
                <a href="#" className={styles.link}>
                  Vault
                </a>
              </li>
              <li>
                <a href="#" className={styles.link}>
                  Compare our memecoins
                </a>
              </li>
              <li>
                <a href="#" className={styles.link}>
                  Bundles
                </a>
              </li>
            </ul>
          </div>

          {/* For Business */}
          <div className={styles.linkSection}>
            <h3 className={styles.linkSectionTitle}>For Business</h3>
            <ul className={styles.linkList}>
              <li>
                <a href="#" className={styles.link}>
                  Stratton Enterprise Solutions
                </a>
              </li>
            </ul>
            <h3 className={styles.linkSectionTitle}>For Startups</h3>
            <ul className={styles.linkList}>
              <li>
                <a href="#" className={styles.link}>
                  Funding from Stratton Cathay Capital
                </a>
              </li>
            </ul>
            <h3 className={styles.linkSectionTitle}>For Developers</h3>
            <ul className={styles.linkList}>
              <li>
                <a href="#" className={styles.link}>
                  The Developer Portal
                </a>
              </li>
            </ul>
            <h3 className={styles.linkSectionTitle}>Get started</h3>
          </div>

          {/* Careers and About */}
          <div className={styles.linkSection}>
            <h3 className={styles.linkSectionTitle}>Careers</h3>
            <ul className={styles.linkList}>
              <li>
                <a href="#" className={styles.link}>
                  Join us
                </a>
              </li>
              <li>
                <a href="#" className={styles.link}>
                  All jobs
                </a>
              </li>
            </ul>
            <h3 className={styles.linkSectionTitle}>About</h3>
            <ul className={styles.linkList}>
              <li>
                <a href="#" className={styles.link}>
                  Our vision
                </a>
              </li>
              <li>
                <a href="#" className={styles.link}>
                  Stratton Academy
                </a>
              </li>
              <li>
                <a href="#" className={styles.link}>
                  The company
                </a>
              </li>
              <li>
                <a href="#" className={styles.link}>
                  The people
                </a>
              </li>
              <li>
                <a href="#" className={styles.link}>
                  Diversity
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
