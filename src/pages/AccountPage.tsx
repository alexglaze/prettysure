import React from "react";
import { useAuthenticator } from "@aws-amplify/ui-react";

const AccountPage: React.FC = () => {
  const { user, signOut } = useAuthenticator();

  const loginId = user?.signInDetails?.loginId ?? "";
  const displayName =
    (loginId && loginId.split("@")[0]) || user?.username || "PrettySure user";

  /** Clear the active photo for this user (matches HomePage localStorage key) */
  const handleRemovePhoto = () => {
    const id = user?.signInDetails?.loginId || user?.username || "anon";
    const photoKey = `ps_activePhoto_${id}`;
    const welcomeKey = `ps_hasSeenHomeWelcome_${id}`;

    try {
      window.localStorage.removeItem(photoKey);
      window.localStorage.removeItem(welcomeKey);
      alert(
        "Your current photo and its local stats have been cleared. " +
          "When you go back to Home, you'll be able to upload a new one."
      );
    } catch (err) {
      console.warn(err);
      alert("Could not clear photo locally. Try again or clear browser storage.");
    }
  };

  /** Placeholder – real delete will require a Cognito/backend flow */
  const handleDeleteAccount = () => {
    alert(
      "Account deletion will be handled through a secure flow.\n\n" +
        "For now, email support@prettysure.app from your signup email " +
        "and request account deletion."
    );
  };

  const handleContactSupport = () => {
    window.location.href =
      "mailto:support@prettysure.app?subject=PrettySure%20support&body=Hi%20PrettySure%20team,%0D%0A%0D%0A";
  };

  const handleDataExport = () => {
    alert(
      "Data export (download of your stats and ratings) will be added later as a safety / Pro feature."
    );
  };

  return (
    <div style={sx.wrap}>
      {/* HEADER */}
      <header style={sx.header}>
        <h1 style={sx.title}>Your Account</h1>
        <p style={sx.subtitle}>
          Signed in as <span style={sx.bold}>{displayName}</span>
        </p>
        {loginId && (
          <p style={sx.subtle}>
            Email: <span style={sx.bold}>{loginId}</span>
          </p>
        )}
        <span style={sx.badge}>Free plan</span>
      </header>

      {/* QUICK ACTION PILLS */}
      <section style={sx.section}>
        <h2 style={sx.sectionTitle}>Quick actions</h2>
        <div style={sx.pillRow}>
          <button style={sx.pillPrimary} onClick={handleContactSupport}>
            Contact support
          </button>
          <button
            style={sx.pillSecondary}
            onClick={() => alert("Profile editing is coming soon.")}
          >
            Edit profile (soon)
          </button>
          <button
            style={sx.pillSecondary}
            onClick={() =>
              alert("Subscription management will be available when Pro launches.")
            }
          >
            Manage subscription
          </button>
        </div>
      </section>

      {/* PRIVACY & LEGAL LINKS */}
      <section style={sx.section}>
        <h2 style={sx.sectionTitle}>Privacy & legal</h2>
        <p style={sx.sectionHint}>
          Learn how PrettySure handles your data and what you agree to when using
          the app.
        </p>

        <div style={sx.cardGrid}>
          <a href="/privacy" style={sx.linkCard}>
            <span style={sx.linkTitle}>Privacy policy</span>
            <span style={sx.linkText}>
              How we store, process, and protect your information.
            </span>
          </a>

          <a href="/terms" style={sx.linkCard}>
            <span style={sx.linkTitle}>Terms & conditions</span>
            <span style={sx.linkText}>
              The rules for using PrettySure and our rating features.
            </span>
          </a>

          <a href="/guidelines" style={sx.linkCard}>
            <span style={sx.linkTitle}>Community guidelines</span>
            <span style={sx.linkText}>
              What’s allowed, what’s not, and how we keep ratings respectful.
            </span>
          </a>
        </div>
      </section>

      {/* PHOTOS & DATA */}
      <section style={sx.section}>
        <h2 style={sx.sectionTitle}>Photos & data</h2>
        <div style={sx.cardGrid}>
          <button style={sx.dangerCard} onClick={handleRemovePhoto}>
            <span style={sx.linkTitle}>Remove current photo</span>
            <span style={sx.linkText}>
              Clears your active upload and its local stats from this device.
            </span>
          </button>

          <button style={sx.mutedCard} onClick={handleDataExport}>
            <span style={sx.linkTitle}>Request data export</span>
            <span style={sx.linkText}>
              Download your ratings and profile data (coming soon).
            </span>
          </button>
        </div>
      </section>

      {/* DANGER ZONE */}
      <section style={sx.section}>
        <h2 style={sx.sectionTitle}>Danger zone</h2>
        <div style={sx.dangerZone}>
          <p style={sx.sectionHint}>
            Deleting your account will disconnect your login from PrettySure and
            remove access to your stats. This requires a separate secure flow.
          </p>
          <button style={sx.deleteBtn} onClick={handleDeleteAccount}>
            Delete account (coming soon)
          </button>
        </div>
      </section>

      {/* SIGN OUT */}
      <section style={sx.section}>
        <button style={sx.signOutBtn} onClick={signOut}>
          Sign out
        </button>
      </section>
    </div>
  );
};

export default AccountPage;

/* ---------- inline styles ---------- */

const sx: Record<string, React.CSSProperties> = {
  wrap: {
    maxWidth: 720,
    margin: "0 auto",
    padding: "12px 8px 40px",
    fontFamily:
      "Inter, system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
  },
  header: {
    marginBottom: 18,
  },
  title: {
    margin: 0,
    fontSize: 26,
    fontWeight: 800,
    color: "#111",
  },
  subtitle: {
    margin: "6px 0 0",
    fontSize: 14,
    color: "#555",
  },
  subtle: {
    margin: "2px 0 8px",
    fontSize: 12,
    color: "#777",
  },
  bold: {
    fontWeight: 600,
  },
  badge: {
    display: "inline-block",
    marginTop: 4,
    padding: "4px 10px",
    borderRadius: 999,
    fontSize: 11,
    fontWeight: 700,
    background: "#f4f4f5",
    color: "#444",
  },
  section: {
    marginTop: 18,
  },
  sectionTitle: {
    margin: "0 0 6px",
    fontSize: 16,
    fontWeight: 700,
    color: "#111",
  },
  sectionHint: {
    margin: "0 0 10px",
    fontSize: 13,
    color: "#666",
  },
  pillRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
  },
  pillPrimary: {
    borderRadius: 999,
    border: "none",
    padding: "8px 14px",
    background: "#111",
    color: "#fff",
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 600,
  },
  pillSecondary: {
    borderRadius: 999,
    border: "1px solid rgba(0,0,0,0.08)",
    padding: "8px 14px",
    background: "rgba(255,255,255,0.8)",
    color: "#222",
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 500,
  },
  cardGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 10,
  },
  linkCard: {
    textDecoration: "none",
    background: "rgba(255,255,255,0.92)",
    border: "1px solid #eee",
    borderRadius: 14,
    padding: 12,
    display: "block",
    color: "#111",
    boxShadow: "0 2px 10px rgba(0,0,0,0.03)",
  },
  mutedCard: {
    background: "#f7f7f7",
    border: "1px dashed #ccc",
    borderRadius: 14,
    padding: 12,
    display: "block",
    color: "#777",
    textAlign: "left",
    cursor: "pointer",
  },
  dangerCard: {
    background: "#fff5f5",
    border: "1px solid #f8c4c4",
    borderRadius: 14,
    padding: 12,
    display: "block",
    color: "#8b1a1a",
    textAlign: "left",
    cursor: "pointer",
  },
  linkTitle: {
    display: "block",
    fontSize: 14,
    fontWeight: 700,
    marginBottom: 4,
  },
  linkText: {
    fontSize: 12,
    color: "#555",
  },
  dangerZone: {
    borderRadius: 14,
    border: "1px solid #f5c2c2",
    background: "#fff5f5",
    padding: 12,
  },
  deleteBtn: {
    marginTop: 8,
    padding: "8px 12px",
    borderRadius: 999,
    border: "none",
    background: "#c1121f",
    color: "#fff",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: 14,
  },
  signOutBtn: {
    marginTop: 4,
    width: "100%",
    padding: "10px 14px",
    borderRadius: 999,
    border: "none",
    background: "#111",
    color: "#fff",
    fontWeight: 700,
    fontSize: 15,
    cursor: "pointer",
  },
};
