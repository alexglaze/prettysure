// src/pages/RatePage.tsx
import React, { useEffect, useMemo, useState } from "react";
import type { Schema } from "../../amplify/data/resource";

type RatePageProps = {
  todos: Array<Schema["Todo"]["type"]>;
  // We keep client typed as any so TS doesn't fight us while this is still a stub
  client: any;
};

const REPORT_CATEGORIES = [
  "Spam / fake",
  "Nudity / sexual content",
  "Violence or harm",
  "Hate / harassment",
  "Underage / minor",
  "Other",
];

const RatePage: React.FC<RatePageProps> = ({ todos }) => {
  const [index, setIndex] = useState(0);
  const [rating, setRating] = useState(5);
  const [canSubmit, setCanSubmit] = useState(false);
  const [cooldownSeconds, setCooldownSeconds] = useState(2);

  const [isReporting, setIsReporting] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // current "photo"
  const currentItem = useMemo(
    () => (todos.length > 0 ? todos[index % todos.length] : null),
    [todos, index]
  );

  // In future, this should be the S3 URL on your photo model
  const currentImageUrl =
    typeof currentItem?.content === "string" &&
    currentItem.content.startsWith("http")
      ? currentItem.content
      : null;

  // Whenever we show a new photo, start 2s cooldown
  useEffect(() => {
    if (!currentItem) return;

    setCanSubmit(false);
    setCooldownSeconds(2);

    const start = Date.now();
    const tick = () => {
      const elapsed = (Date.now() - start) / 1000;
      const remaining = Math.max(0, 2 - elapsed);
      setCooldownSeconds(remaining);
      if (remaining <= 0) {
        setCanSubmit(true);
        clearInterval(timer);
      }
    };

    const timer = window.setInterval(tick, 200);
    return () => window.clearInterval(timer);
  }, [currentItem]);

  const handleNextPhoto = () => {
    if (todos.length === 0) return;
    setIndex((prev) => (prev + 1) % todos.length);
    setRating(5);
  };

  const handleSubmitRating = () => {
    if (!currentItem || !canSubmit) return;

    // TODO: Wire this to your real "Rating" model / API.
    // For now, just log so nothing breaks.
    console.log("Submitted rating", {
      todoId: currentItem.id,
      rating,
    });

    // Move to next photo
    handleNextPhoto();
  };

  const openReport = () => {
    if (!currentItem) return;
    setSelectedCategory(null);
    setIsReporting(true);
  };

  const closeReport = () => {
    setIsReporting(false);
    setSelectedCategory(null);
  };

  const submitReport = () => {
    if (!currentItem || !selectedCategory) return;

    // TODO: send to backend, increment report count and,
    // after threshold, remove from rotation & call AWS moderation.
    console.log("Report submitted", {
      todoId: currentItem.id,
      category: selectedCategory,
    });

    closeReport();
    // Optionally skip this photo immediately:
    handleNextPhoto();
  };

  const disabledReason =
    !currentItem
      ? "No photos available"
      : !canSubmit
      ? `Look for ${cooldownSeconds.toFixed(1)}s…`
      : "";

  return (
    <div style={sx.pageWrap}>
      {/* Side ad columns (hidden on small screens via maxWidth layout) */}
      <div style={sx.sideColumn}>
        <div style={sx.adBox}>Ad space</div>
      </div>

      {/* Center column with rating pill */}
      <div style={sx.centerColumn}>
        <header style={sx.header}>
          <h1 style={sx.heading}>Rate Photos</h1>
          <p style={sx.caption}>Rating others is how you get rated.</p>
        </header>

        {/* Main photo pill */}
        <section style={sx.photoCard}>
          {currentItem ? (
            <>
              {currentImageUrl ? (
                <img
                  src={currentImageUrl}
                  alt="User upload"
                  style={sx.photoImg}
                />
              ) : (
                <div style={sx.photoPlaceholder}>
                  <span style={sx.photoPlaceholderText}>
                    This is where other users’ photos will appear.
                    <br />
                    (Hook this up to your S3 image URLs.)
                  </span>
                </div>
              )}
            </>
          ) : (
            <div style={sx.photoPlaceholder}>
              <span style={sx.photoPlaceholderText}>
                No photos in the rating bucket yet.
                <br />
                Invite friends or upload more photos.
              </span>
            </div>
          )}
        </section>

        {/* Slider + labels */}
        <section style={sx.sliderSection}>
          <div style={sx.sliderLabels}>
            <span style={sx.sliderLabelLeft}>Not my type</span>
            <span style={sx.sliderLabelRight}>Hubba hubba</span>
          </div>
          <input
            type="range"
            min={1}
            max={10}
            value={rating}
            onChange={(e) => setRating(Number(e.target.value))}
            style={sx.slider}
            disabled={!currentItem}
          />
          <div style={sx.sliderValueRow}>
            <span style={sx.sliderValueLabel}>Your rating:</span>
            <span style={sx.sliderValue}>{rating} / 10</span>
          </div>
        </section>

        {/* Action buttons */}
        <section style={sx.actionsRow}>
          <button
            type="button"
            onClick={openReport}
            style={sx.reportBtn}
            disabled={!currentItem}
          >
            Report
          </button>

          <button
            type="button"
            onClick={handleSubmitRating}
            disabled={!currentItem || !canSubmit}
            style={{
              ...sx.submitBtn,
              ...( !currentItem || !canSubmit ? sx.submitBtnDisabled : {} ),
            }}
          >
            {currentItem
              ? canSubmit
                ? "Submit rating"
                : `Please look…`
              : "No photos"}
          </button>
        </section>
      </div>

      {/* Right ad column */}
      <div style={sx.sideColumn}>
        <div style={sx.adBox}>Ad space</div>
      </div>

      {/* Bottom ad bar */}
      <div style={sx.bottomAdBar}>
        <div style={sx.bottomAdInner}>Bottom ad placement</div>
      </div>

      {/* Report modal */}
      {isReporting && (
        <div style={sx.modalBackdrop} onClick={closeReport}>
          <div
            style={sx.modal}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={sx.modalTitle}>Report this photo</h3>
            <p style={sx.modalText}>
              What’s wrong with this photo? Choose the closest option.
            </p>
            <div style={sx.modalChipGrid}>
              {REPORT_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  style={{
                    ...sx.chip,
                    ...(selectedCategory === cat ? sx.chipActive : {}),
                  }}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
            <div style={sx.modalActions}>
              <button
                type="button"
                onClick={closeReport}
                style={sx.modalCancelBtn}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submitReport}
                disabled={!selectedCategory}
                style={{
                  ...sx.modalSubmitBtn,
                  ...(!selectedCategory ? sx.modalSubmitDisabled : {}),
                }}
              >
                Submit report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Little helper text at the very bottom for now */}
      {disabledReason && (
        <div style={sx.helperHint}>{disabledReason}</div>
      )}
    </div>
  );
};

export default RatePage;

/* ---------- inline styles ---------- */

const sx: Record<string, React.CSSProperties> = {
  pageWrap: {
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    gap: 16,
    paddingTop: 16,
    position: "relative",
  },
  sideColumn: {
    flex: 1,
    display: "flex",
    justifyContent: "center",
    paddingTop: 64,
  },
  adBox: {
    width: 140,
    height: 300,
    borderRadius: 12,
    background: "rgba(0,0,0,0.06)",
    border: "1px dashed rgba(0,0,0,0.12)",
    fontSize: 12,
    color: "#555",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  centerColumn: {
    flexShrink: 0,
    width: "100%",
    maxWidth: 500,
    paddingBottom: 80, // room above bottom ad bar
  },
  header: {
    textAlign: "center",
    marginBottom: 16,
  },
  heading: {
    margin: 0,
    fontSize: 24,
    fontWeight: 700,
    color: "#111",
  },
  caption: {
    marginTop: 6,
    fontSize: 14,
    color: "#555",
  },
  photoCard: {
    borderRadius: 20,
    background: "#fdfdfd",
    boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
    overflow: "hidden",
    height: 380,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  photoImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  },
  photoPlaceholder: {
    width: "100%",
    height: "100%",
    background: "linear-gradient(135deg, #f5f5f5, #e9e9e9)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    textAlign: "center",
  },
  photoPlaceholderText: {
    fontSize: 14,
    color: "#555",
    lineHeight: 1.5,
  },
  sliderSection: {
    marginTop: 20,
  },
  sliderLabels: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  sliderLabelLeft: { textAlign: "left" },
  sliderLabelRight: { textAlign: "right" },
  slider: {
    width: "100%",
  },
  sliderValueRow: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 6,
    marginTop: 4,
    fontSize: 13,
  },
  sliderValueLabel: { color: "#666" },
  sliderValue: {
    fontWeight: 700,
    color: "#111",
  },
  actionsRow: {
    marginTop: 18,
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
  },
  reportBtn: {
    flex: 1,
    borderRadius: 999,
    border: "1px solid #ffb3b3",
    background: "#fff5f5",
    padding: "10px 12px",
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 600,
    color: "#a30d0d",
  },
  submitBtn: {
    flex: 1.3,
    borderRadius: 999,
    border: "none",
    background: "#111",
    padding: "10px 16px",
    cursor: "pointer",
    fontSize: 15,
    fontWeight: 700,
    color: "#fff",
    transition: "opacity 0.15s ease",
  },
  submitBtnDisabled: {
    background: "#999",
    cursor: "not-allowed",
    opacity: 0.7,
  },
  bottomAdBar: {
    position: "fixed",
    left: 0,
    right: 0,
    bottom: 0,
    display: "flex",
    justifyContent: "center",
    pointerEvents: "none", // content above remains clickable except inner ad
  },
  bottomAdInner: {
    pointerEvents: "auto",
    marginBottom: 8,
    padding: "8px 16px",
    borderRadius: 999,
    background: "rgba(255,255,255,0.95)",
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
    fontSize: 12,
    color: "#444",
  },
  modalBackdrop: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.45)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 50,
  },
  modal: {
    width: "100%",
    maxWidth: 420,
    background: "#fff",
    borderRadius: 16,
    padding: 20,
    boxShadow: "0 12px 40px rgba(0,0,0,0.25)",
  },
  modalTitle: {
    margin: "0 0 4px",
    fontSize: 18,
    fontWeight: 700,
  },
  modalText: {
    margin: "0 0 12px",
    fontSize: 14,
    color: "#555",
  },
  modalChipGrid: {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  chip: {
    padding: "6px 10px",
    borderRadius: 999,
    border: "1px solid #ddd",
    background: "#fafafa",
    fontSize: 13,
    cursor: "pointer",
  },
  chipActive: {
    borderColor: "#111",
    background: "#111",
    color: "#fff",
  },
  modalActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 8,
  },
  modalCancelBtn: {
    borderRadius: 999,
    border: "none",
    background: "#f3f3f3",
    padding: "8px 12px",
    fontSize: 14,
    cursor: "pointer",
  },
  modalSubmitBtn: {
    borderRadius: 999,
    border: "none",
    background: "#111",
    padding: "8px 14px",
    fontSize: 14,
    fontWeight: 600,
    color: "#fff",
    cursor: "pointer",
  },
  modalSubmitDisabled: {
    background: "#999",
    cursor: "not-allowed",
    opacity: 0.7,
  },
  helperHint: {
    position: "fixed",
    bottom: 48,
    left: 0,
    right: 0,
    textAlign: "center",
    fontSize: 11,
    color: "#555",
    pointerEvents: "none",
  },
};
