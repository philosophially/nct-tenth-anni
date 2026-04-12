import { useState, useEffect } from "react";
import styles from "./LibraryShelf.module.css";
import { MOODS } from "../data/albums";
import { supabase, supabaseReady } from "../lib/supabase";

const SPINE_COLOURS = [
  "#6B3FA0",
  "#2E86AB",
  "#A23B72",
  "#F18F01",
  "#C73E1D",
  "#3B1F2B",
  "#44BBA4",
  "#E94F37",
  "#393E41",
  "#2541B2",
  "#7B2D8B",
  "#1B998B",
  "#E84855",
  "#5C4033",
  "#0D7377",
  "#8B2FC9",
  "#D62246",
  "#4A90D9",
  "#2D6A4F",
  "#C05299",
];

const SPINE_FONTS = [
  "Shadows Into Light",
  "Caveat Brush",
  "Schoolbell",
  "Margarine",
  "Coming Soon",
  "Finger Paint",
  "Mynerve",
  "Indie Flower",
];

function spineColourForEntry(entry) {
  const idStr = String(entry.id);
  const code = idStr.charCodeAt(0) || 0;
  return SPINE_COLOURS[code % SPINE_COLOURS.length];
}

function detectScript(text) {
  if (!text) return "latin";
  if (/[\uAC00-\uD7A3\u1100-\u11FF\u3130-\u318F]/.test(text))
    return "korean";
  if (/[\u0E00-\u0E7F]/.test(text)) return "thai";
  if (/[\u3040-\u30FF\u4E00-\u9FFF]/.test(text)) return "japanese";
  return "latin";
}

function spineFontForEntry(entry) {
  const script = detectScript(entry.nickname);
  if (script === "korean") return "Gamja Flower";
  if (script === "thai") return "Playpen Sans Thai";
  if (script === "japanese") return "Yomogi";
  const idStr = String(entry.id);
  const code = idStr.length > 1
    ? idStr.charCodeAt(1)
    : idStr.charCodeAt(0);
  return SPINE_FONTS[code % SPINE_FONTS.length];
}

const MOOD_KEYS = MOODS.map((m) => m.key);
const gridMoods = MOODS.slice(0, 9);
const favMood = MOODS[9];

function buildSelectionsFromRow(row) {
  // row columns: mood_청량, album_cover_청량, etc.
  const sel = {};
  MOOD_KEYS.forEach((key) => {
    const colKey = key === "favorite" ? "mood_favorite" : `mood_${key}`;
    const coverKey =
      key === "favorite" ? "album_cover_favorite" : `album_cover_${key}`;
    if (row[colKey]) {
      sel[key] = {
        track: row[colKey],
        albumCover: row[coverKey] || "",
        albumTitle: "",
      };
    }
  });
  return sel;
}

function EntryModal({ entry, onClose }) {
  const selections = buildSelectionsFromRow(entry);

  function renderSlot(mood) {
    const sel = selections[mood.key];
    const isFav = mood.key === "favorite";
    return (
      <div key={mood.key} className={styles.previewSlot}>
        {sel ? (
          <img
            className={styles.previewThumb}
            src={sel.albumCover}
            alt={sel.track}
          />
        ) : (
          <div className={styles.previewThumbEmpty} />
        )}
        <div className={styles.previewInfo}>
          {isFav ? (
            <span className={styles.previewHashtag}>⭐ My Fave</span>
          ) : (
            <>
              <span className={styles.previewHashtag}>{mood.korean}</span>
              <span className={styles.previewEnglish}>{mood.english}</span>
            </>
          )}
          {sel && <span className={styles.previewSong}>{sel.track}</span>}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.modalBackdrop} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button
          className={styles.modalClose}
          onClick={onClose}
          aria-label="Close"
        >
          ✕
        </button>
        <div className={styles.modalNick}>{entry.nickname}</div>
        <div className={styles.modalDate}>
          {new Date(entry.created_at).toLocaleDateString("ko-KR", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </div>
        <div className={styles.previewGrid}>{gridMoods.map(renderSlot)}</div>
        <div className={styles.previewFavRow}>{renderSlot(favMood)}</div>
      </div>
    </div>
  );
}

export default function LibraryShelf() {
  const [active, setActive] = useState(null);
  const [entries, setEntries] = useState([]);
  const [hasMore, setHasMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    if (!supabaseReady) return;

    let cancelled = false;

    async function loadInitial() {
      const { data } = await supabase
        .from("submissions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(29);
      if (cancelled) return;
      const rows = data ?? [];
      setEntries(rows);
      setHasMore(rows.length === 29);
      setOffset(rows.length === 29 ? 29 : 0);
    }

    loadInitial();

    const channel = supabase
      .channel("submissions-stream")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "submissions" },
        (payload) => setEntries((prev) => [payload.new, ...prev]),
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, []);

  async function handleLoadMore() {
    if (!supabaseReady || loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const from = offset;
      const { data, error } = await supabase
        .from("submissions")
        .select("*")
        .order("created_at", { ascending: false })
        .range(from, from + 28);
      if (error) return;
      const batch = data ?? [];
      if (batch.length > 0) {
        setEntries((prev) => [...prev, ...batch]);
      }
      if (batch.length < 29) setHasMore(false);
      setOffset((o) => o + 29);
    } finally {
      setLoadingMore(false);
    }
  }

  return (
    <section className={styles.section} id="community">
      <div className={styles.sectionTitle}>The Community Shelf</div>
      <div className={styles.shelfWrapper}>
        <div className={styles.spineRow}>
          {entries.length === 0 && (
            <div className={styles.empty}>No entries yet — be the first!</div>
          )}
          {entries.map((entry) => {
            const script = detectScript(entry.nickname);
            const isNativeVertical =
              script === "korean" ||
              script === "thai" ||
              script === "japanese";
            return (
              <button
                key={entry.id}
                type="button"
                className={styles.spine}
                style={{ backgroundColor: spineColourForEntry(entry) }}
                onClick={() => setActive(entry)}
                title={entry.nickname}
              >
                <span
                  className={styles.spineText}
                  style={{
                    fontFamily: `'${spineFontForEntry(entry)}', sans-serif`,
                    transform: isNativeVertical ? "none" : "rotate(180deg)",
                  }}
                >
                  {entry.nickname}
                </span>
              </button>
            );
          })}
        </div>
      </div>
      {hasMore && (
        <button
          type="button"
          className={styles.loadMoreBtn}
          onClick={handleLoadMore}
          disabled={loadingMore}
        >
          {loadingMore ? "[ ▸ loading... ]" : "[ ▸ load 29 more ]"}
        </button>
      )}
      <div className={styles.shadow} />

      {active && <EntryModal entry={active} onClose={() => setActive(null)} />}
    </section>
  );
}
