import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useAuthenticator } from "@aws-amplify/ui-react";

interface StoredState {
  photoUrl: string | null;
  uploadedAt: number | null;
  expiresAt: number | null;
  ratingCount: number;
  avgRating: number | null;
}

const MAX_SHEET = 420; // expanded height (px)
const MIN_SHEET = 120; // collapsed height (px);

const HomePage: React.FC = () => {
  const { user } = useAuthenticator();

  // --- Greeting logic ---
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    const id = user?.signInDetails?.loginId || user?.username || "anon";
    const key = `ps_hasSeenHomeWelcome_${id}`;
    const seen = window.localStorage.getItem(key);
    if (!seen) {
      setShowWelcome(true);
      window.localStorage.setItem(key, "1");
    }
  }, [user]);

  const displayName = useMemo(() => {
    const loginId = user?.signInDetails?.loginId;
    if (loginId) {
      const atIndex = loginId.indexOf("@");
      if (atIndex > 0) return loginId.slice(0, atIndex);
      return loginId;
    }
    if (user?.username) return user.username;
    return "there";
  }, [user]);

  // --- Photo + stats state (persisted per user in localStorage) ---
  const storageKey = useMemo(() => {
    const id = user?.signInDetails?.loginId || user?.username || "anon";
    return `ps_activePhoto_${id}`;
  }, [user]);

  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [uploadedAt, setUploadedAt] = useState<number | null>(null);
  const [expiresAt, setExpiresAt] = useState<number | null>(null);
  const [ratingCount, setRatingCount] = useState<number>(0);
  const [avgRating, setAvgRating] = useState<number | null>(null);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (raw) {
        const data: StoredState = JSON.parse(raw);
        setPhotoUrl(data.photoUrl ?? null);
        setUploadedAt(data.uploadedAt ?? null);
        setExpiresAt(data.expiresAt ?? null);
        setRatingCount(data.ratingCount ?? 0);
        setAvgRating(
          typeof data.avgRating === "number" ? data.avgRating : null
        );
      }
    } catch (e) {
      console.warn("Failed to load saved photo", e);
    }
  }, [storageKey]);

  const persist = (updates: Partial<StoredState>) => {
    const current: StoredState = {
      photoUrl,
      uploadedAt,
      expiresAt,
      ratingCount,
      avgRating,
    };
    const next: StoredState = { ...current, ...updates };
    window.localStorage.setItem(storageKey, JSON.stringify(next));
  };

  // --- Upload handling ---
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handlePick = () => fileInputRef.current?.click();

  const handleFile: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;

    const objUrl = URL.createObjectURL(f);

    // 48-hour lifetime
    const now = Date.now();
    const LIFETIME_MS = 48 * 60 * 60 * 1000;

    setPhotoUrl(objUrl);
    setUploadedAt(now);
    setExpiresAt(now + LIFETIME_MS);
    setRatingCount(0);
    setAvgRating(null);

    persist({
      photoUrl: objUrl,
      uploadedAt: now,
      expiresAt: now + LIFETIME_MS,
      ratingCount: 0,
      avgRating: null,
    });
  };

  // Demo stat updates (temporary)
  useEffect(() => {
    if (!photoUrl) return;

    const id = window.setInterval(() => {
      setRatingCount((c) => {
        const next = c + Math.floor(Math.random() * 3);
        persist({ ratingCount: next });
        return next;
      });
      setAvgRating((r) => {
        const base = r ?? 7.5;
        const jitter = (Math.random() - 0.5) * 0.1;
        const next = Math.max(1, Math.min(10, +(base + jitter).toFixed(2)));
        persist({ avgRating: next });
        return next;
      });
    }, 5000);

    return () => window.clearInterval(id);
  }, [photoUrl]);

  // Clean up blob URLs
  useEffect(() => {
    return () => {
      if (photoUrl && photoUrl.startsWith("blob:")) {
        try {
          URL.revokeObjectURL(photoUrl);
        } catch {
          // ignore
        }
      }
    };
  }, [photoUrl]);

  // --- Bottom sheet drag logic ---
  const [sheetHeight, setSheetHeight] = useState<number>(MIN_SHEET);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartY = useRef<number | null>(null);
  const startHeight = useRef<number>(MIN_SHEET);

  const onDragStart = (clientY: number) => {
    setIsDragging(true);
    dragStartY.current = clientY;
    startHeight.current = sheetHeight;
  };

  const onDragMove = (clientY: number) => {
    if (!isDragging || dragStartY.current == null) return;
    const dy = dragStartY.current - clientY;
    const next = clamp(startHeight.current + dy, MIN_SHEET, MAX_SHEET);
    setSheetHeight(next);
  };

  const onDragEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    const snap =
      sheetHeight > (MIN_SHEET + MAX_SHEET) / 2 ? MAX_SHEET : MIN_SHEET;
    setSheetHeight(snap);
  };

  const handleMouseDown: React.MouseEventHandler<HTMLDivElement> = (e) =>
    onDragStart(e.clientY);
  const handleMouseMove: React.MouseEventHandler<HTMLDivElement> = (e) =>
    onDragMove(e.clientY);
  const handleMouseUp: React.MouseEventHandler<HTMLDivElement> = () =>
    onDragEnd();

  const handleTouchStart: React.TouchEventHandler<HTMLDivElement> = (e) =>
    onDragStart(e.touches[0].clientY);
  const handleTouchMove: React.TouchEventHandler<HTMLDivElement> = (e) =>
    onDragMove(e.touches[0].clientY);
  const handleTouchEnd: React.TouchEventHandler<HTMLDivElement> = () =>
    onDragEnd();

  // derived timers
  const now = Date.now();
  const ageMs = uploadedAt ? now - uploadedAt : null;
  const timeLeftMs = expiresAt ? Math.max(0, expiresAt - now) : null;

  return (
    <div
      style={sx.container}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {/* greeting */}
      <header style={sx.header}>
        {showWelcome ? (
          <>
            <h1 style={sx.heading}>Welcome to PrettySure</h1>
            <p style={sx.subtitle}>Rate and get rated by others.</p>
          </>
        ) : (
          <h1 style={sx.heading}>Hello, {displayName}</h1>
        )}
      </header>

      {/* main self image card */}
      <section style={sx.mainCardWrap}>
        <div style={sx.mainCard}>
          {photoUrl ? (
            <>
              <img src={photoUrl} alt="Your upload" style={sx.image} />
              <div style={sx.imageOverlay}>
                <button style={sx.replaceBtn} onClick={handlePick}>
                  Replace Photo
                </button>
              </div>
            </>
          ) : (
            <div style={sx.uploadEmpty}>
              <div style={sx.uploadEmptyInner}>
                <div style={sx.uploadIcon}>
                  <span aria-hidden>⬆️</span>
                </div>
                <h3 style={sx.uploadTitle}>Upload Your Photo</h3>
                <p style={sx.uploadHint}>
                  Add a clear, front-facing selfie to start getting rated.
                </p>
                <button style={sx.uploadBtn} onClick={handlePick}>
                  Choose Photo
                </button>
                <p style={sx.uploadNote}>
                  Your photo will be visible for 48 hours.
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* quick actions row */}
      <section style={sx.quickActions}>
        <div style={sx.actionGrid}>
          <div style={sx.actionCard} onClick={handlePick}>
            <h4>Upload</h4>
            <p>Replace your photo</p>
          </div>

          {/* Premium, greyed out Compare Photos card */}
          <div style={sx.actionCardDisabled}>
            <h4>Compare photos</h4>
            <p>Premium – AB test your pics</p>
          </div>
        </div>
      </section>

      {/* swipe-up stats sheet */}
      <div
        style={{ ...sx.sheet, height: sheetHeight }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div style={sx.sheetHandle} />
        <div style={sx.sheetContent}>
          <h3 style={sx.sheetTitle}>Your Photo Stats</h3>

          {!photoUrl ? (
            <p style={sx.sheetText}>
              Upload a photo to start gathering ratings.
            </p>
          ) : (
            <div style={sx.statsGrid}>
              <Stat
                label="Average Rating"
                value={avgRating ? `${avgRating.toFixed(2)} / 10` : "—"}
              />
              <Stat label="Ratings" value={ratingCount.toString()} />
              <Stat
                label="Live For"
                value={ageMs != null ? fmtDuration(ageMs) : "—"}
              />
              <Stat
                label="Time Left"
                value={timeLeftMs != null ? fmtDuration(timeLeftMs) : "—"}
              />
            </div>
          )}

          <div style={sx.sheetFooter}>
            <button
              onClick={() =>
                setSheetHeight(
                  sheetHeight === MIN_SHEET ? MAX_SHEET : MIN_SHEET
                )
              }
              style={sx.expandBtn}
            >
              {sheetHeight === MIN_SHEET ? "Expand" : "Collapse"}
            </button>
          </div>
        </div>
      </div>

      {/* hidden file input */}
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleFile}
        style={{ display: "none" }}
      />
    </div>
  );
};

export default HomePage;

// stat card component
const Stat: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div style={sx.statCard}>
    <div style={sx.statLabel}>{label}</div>
    <div style={sx.statValue}>{value}</div>
  </div>
);

// helpers
function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function fmtDuration(ms: number) {
  const sec = Math.floor(ms / 1000);
  const d = Math.floor(sec / 86400);
  const h = Math.floor((sec % 86400) / 3600);
  const m = Math.floor((sec % 3600) / 60);
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

// inline styles
const sx: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: 600,
    margin: "0 auto",
    paddingTop: 20,          // ⬅️ pushes everything down so nothing is cut off
    paddingBottom: 180,
    fontFamily:
      "Inter, system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
    position: "relative",
  },
  header: {
    padding: "0 16px 12px",
    textAlign: "center",
  },
  heading: {
    fontSize: 24,
    fontWeight: 700,
    margin: 0,
    color: "#111",
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 6,
  },
  mainCardWrap: {
    padding: "0 16px",
  },
  mainCard: {
    position: "relative",
    borderRadius: 16,
    overflow: "hidden",
    background: "#f2f2f2",
    height: 420,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
  },
  image: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  },
  imageOverlay: {
    position: "absolute",
    right: 12,
    top: 12,
  },
  replaceBtn: {
    background: "#111",
    color: "#fff",
    fontSize: 12,
    border: 0,
    borderRadius: 999,
    padding: "8px 12px",
    cursor: "pointer",
  },
  uploadEmpty: {
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(180deg, #fafafa, #f0f0f0)",
  },
  uploadEmptyInner: {
    textAlign: "center",
    padding: 16,
  },
  uploadIcon: {
    width: 56,
    height: 56,
    borderRadius: 14,
    background: "#111",
    color: "#fff",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
    fontSize: 24,
  },
  uploadTitle: { fontSize: 18, margin: "0 0 6px", color: "#111" },
  uploadHint: { fontSize: 13, margin: "0 0 12px", color: "#666" },
  uploadBtn: {
    background: "#111",
    color: "#fff",
    fontSize: 14,
    border: 0,
    borderRadius: 12,
    padding: "10px 14px",
    cursor: "pointer",
  },
  uploadNote: { fontSize: 12, color: "#777", marginTop: 10 },

  quickActions: {
    padding: 16,
  },
  actionGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 12,
  },
  actionCard: {
    background: "#fff",
    border: "1px solid #eee",
    borderRadius: 12,
    padding: 12,
    textAlign: "center",
    boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
    cursor: "pointer",
  },
  actionCardDisabled: {
    background: "#f3f3f3",
    border: "1px dashed #ccc",
    borderRadius: 12,
    padding: 12,
    textAlign: "center",
    boxShadow: "0 2px 8px rgba(0,0,0,0.01)",
    color: "#999",
    cursor: "not-allowed",
  },

  sheet: {
    position: "fixed",
    left: 0,
    right: 0,
    bottom: 0,
    background: "#fff",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    boxShadow: "0 -10px 30px rgba(0,0,0,0.08)",
    transition: "height 160ms ease",
    touchAction: "none",
    userSelect: "none",
    overflow: "hidden",
  },
  sheetHandle: {
    width: 42,
    height: 5,
    borderRadius: 999,
    background: "#ddd",
    margin: "8px auto",
  },
  sheetContent: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    padding: "0 16px 12px",
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: 700,
    textAlign: "center",
    margin: "4px 0 12px",
  },
  sheetText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 12,
    paddingBottom: 8,
  },
  statCard: {
    background: "#fafafa",
    border: "1px solid #eee",
    borderRadius: 12,
    padding: 12,
    textAlign: "center",
  },
  statLabel: { fontSize: 12, color: "#666" },
  statValue: { fontSize: 18, fontWeight: 700, color: "#111" },
  sheetFooter: {
    marginTop: "auto",
    display: "flex",
    justifyContent: "center",
    paddingTop: 8,
  },
  expandBtn: {
    background: "#111",
    color: "#fff",
    border: 0,
    borderRadius: 999,
    padding: "10px 16px",
    fontSize: 14,
    cursor: "pointer",
  },
};
