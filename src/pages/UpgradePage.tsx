import React, { useState } from "react";
import { AiOutlineCrown, AiOutlineCheckCircle } from "react-icons/ai";

export default function UpgradePage() {
  const [billing, setBilling] = useState<"monthly" | "annual">("monthly");

  return (
    <div style={styles.container}>
      {/* HEADER */}
      <div style={styles.header}>
        <div style={styles.proBadge}>
          <AiOutlineCrown size={18} />
          <span>PrettySure Pro</span>
        </div>

        <h1 style={styles.title}>Unlock Your Full Potential</h1>
        <p style={styles.subtitle}>
          Get advanced insights, priority visibility, and creator-grade tools that help you look your best.
        </p>
      </div>

      {/* BILLING TOGGLE */}
      <div style={styles.billingToggle}>
        <button
          style={{
            ...styles.toggleButton,
            ...(billing === "monthly" ? styles.toggleActive : {}),
          }}
          onClick={() => setBilling("monthly")}
        >
          Monthly
        </button>

        <button
          style={{
            ...styles.toggleButton,
            ...(billing === "annual" ? styles.toggleActive : {}),
          }}
          onClick={() => setBilling("annual")}
        >
          Annual <span style={styles.saveTag}>Save 15%</span>
        </button>
      </div>

      {/* PRICE BOX */}
      <div style={styles.priceBox}>
        <h2 style={styles.priceText}>
          {billing === "monthly" ? "$4.99 / month" : "$49.99 / year"}
        </h2>
        <p style={styles.priceNote}>Cancel anytime.</p>
      </div>

      {/* FEATURES LIST */}
      <div style={styles.featuresCard}>
        <h3 style={styles.featuresHeader}>Pro Includes:</h3>

        <Feature text="Detailed analytics & rating breakdowns" />
        <Feature text="Percentile rank among all users" />
        <Feature text="Priority visibility in Rate & Discover" />
        <Feature text="Compare two photos (A/B testing)" />
        <Feature text="Smart alerts for rating spikes & dips" />
        <Feature text="Faster photo moderation" />
      </div>

      {/* CTA BUTTON */}
      <button style={styles.ctaButton}>
        Upgrade Now
      </button>

      <p style={styles.disclaimer}>Payments handled securely through AWS or Stripe (coming soon).</p>
    </div>
  );
}

/* Feature Row Component */
function Feature({ text }: { text: string }) {
  return (
    <div style={styles.featureRow}>
      <AiOutlineCheckCircle size={18} color="#6a00ff" />
      <span style={styles.featureText}>{text}</span>
    </div>
  );
}

/* ------------------ STYLES ------------------ */
const styles: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: 700,
    margin: "0 auto",
    padding: "24px 16px 30px",
    fontFamily: "Inter, system-ui, -apple-system, sans-serif",
  },

  header: {
    textAlign: "center",
    marginBottom: 24,
  },

  proBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    background: "#111",
    color: "#fcfcfcff",
    padding: "8px 14px",
    borderRadius: 999,
    fontSize: 14,
    fontWeight: 700,
  },

  title: {
    marginTop: 16,
    fontSize: 26,
    fontWeight: 800,
    color: "#111",
  },

  subtitle: {
    marginTop: 8,
    fontSize: 14,
    color: "#000000ff",
    lineHeight: 1.5,
  },

  billingToggle: {
    marginTop: 24,
    display: "flex",
    gap: 10,
    justifyContent: "center",
  },

  toggleButton: {
    padding: "10px 16px",
    borderRadius: 999,
    border: "1px solid #ddd",
    background: "#b6b6b6ff",
    cursor: "pointer",
    fontWeight: 600,
  },

  toggleActive: {
    background: "#6a00ff",
    color: "#fff",
    border: "1px solid #6a00ff",
  },

  saveTag: {
    background: "#ffe89e",
    color: "#7a4a00",
    padding: "2px 6px",
    borderRadius: 8,
    marginLeft: 6,
    fontSize: 12,
    fontWeight: 600,
  },

  priceBox: {
    textAlign: "center",
    marginTop: 20,
  },

  priceText: {
    fontSize: 28,
    fontWeight: 800,
    color: "#111",
  },

  priceNote: {
    fontSize: 13,
    color: "#000000ff",
    marginTop: 4,
  },

  featuresCard: {
    background: "#fff",
    borderRadius: 16,
    padding: 20,
    border: "1px solid #eee",
    marginTop: 24,
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
  },

  featuresHeader: {
    marginBottom: 12,
    fontSize: 18,
    fontWeight: 700,
    color: "#111",
  },

  featureRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "10px 0",
  },

  featureText: {
    fontSize: 15,
    color: "#000000ff",
  },

  ctaButton: {
    marginTop: 28,
    width: "100%",
    padding: "14px 18px",
    background: "#6a00ff",
    color: "#fff",
    border: "none",
    borderRadius: 12,
    fontSize: 16,
    fontWeight: 700,
    cursor: "pointer",
  },

  disclaimer: {
    textAlign: "center",
    marginTop: 12,
    fontSize: 12,
    color: "#000000ff",
  },
};
