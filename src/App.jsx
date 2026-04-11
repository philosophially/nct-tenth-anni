import { useState } from "react";
import CDShelf from "./components/CDShelf";
import TemplatePanel from "./components/TemplatePanel";
import MoodPicker from "./components/MoodPicker";
import LibraryShelf from "./components/LibraryShelf";
import VinylBackground from "./components/VinylBackground";
import { SHELF_CONFIG, MOODS } from "./data/albums";
import { supabase, supabaseReady } from "./lib/supabase";
import styles from "./App.module.css";

const MOOD_KEYS = MOODS.map((m) => m.key);

const MARQUEE_TEXT =
  "🎵 취향의 NCT  ·  NCT 10TH ANNIVERSARY  ·  PICK YOUR PLAYLIST  ·  OPEN SINCE 2016  ·  SEOUL  ·  ";

export default function App() {
  const [selections, setSelections] = useState({});
  const [pendingTrack, setPendingTrack] = useState(null);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [nickname, setNickname] = useState("");
  const [submitState, setSubmitState] = useState("idle");
  const [submitError, setSubmitError] = useState("");

  function handleTrackSelect(info) {
    setPendingTrack(info);
  }

  function handleMoodSelect(moodKey, trackInfo) {
    setSelections((prev) => ({ ...prev, [moodKey]: trackInfo }));
    setPendingTrack(null);
  }

  function handleMoodCancel() {
    setPendingTrack(null);
  }

  // Fix 2: remove a slot
  function handleRemove(moodKey) {
    setSelections((prev) => {
      const next = { ...prev };
      delete next[moodKey];
      return next;
    });
  }

  function handleComplete() {
    setShowSubmitModal(true);
    setSubmitState("idle");
    setNickname("");
    setSubmitError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const name = nickname.trim();
    if (!name) {
      setSubmitError("Please enter a shelf name.");
      return;
    }
    if (/[^a-zA-Z0-9가-힣ㄱ-ㅎㅏ-ㅣ _\-!?.~♡♥]/.test(name)) {
      setSubmitError("No special characters please!");
      return;
    }
    if (!supabaseReady) {
      setSubmitError(
        "Supabase is not configured yet. Add your keys to .env.local.",
      );
      return;
    }
    setSubmitState("loading");
    setSubmitError("");
    const row = { nickname: name };
    MOOD_KEYS.forEach((key) => {
      const col = key === "favorite" ? "mood_favorite" : `mood_${key}`;
      const coverCol =
        key === "favorite" ? "album_cover_favorite" : `album_cover_${key}`;
      const sel = selections[key];
      row[col] = sel ? sel.track : null;
      row[coverCol] = sel ? sel.albumCover : null;
    });
    const { error } = await supabase.from("submissions").insert([row]);
    if (error) {
      setSubmitState("error");
      setSubmitError(error.message);
    } else setSubmitState("success");
  }

  function handleReset() {
    setSelections({});
    setShowSubmitModal(false);
    setSubmitState("idle");
  }

  return (
    <div className={styles.app}>
      {/* ===== DECORATIVE VINYL BACKGROUND ===== */}
      <VinylBackground />

      {/* ===== AMBIENT MARQUEE BAR ===== */}
      <div className={styles.marqueeBar} aria-hidden="true">
        <div className={styles.marqueeTrack}>
          {/* doubled for seamless loop */}
          <span className={styles.marqueeText}>
            {MARQUEE_TEXT}
            {MARQUEE_TEXT}
            {MARQUEE_TEXT}
            {MARQUEE_TEXT}
          </span>
          <span className={styles.marqueeText}>
            {MARQUEE_TEXT}
            {MARQUEE_TEXT}
            {MARQUEE_TEXT}
            {MARQUEE_TEXT}
          </span>
        </div>
      </div>

      {/* ===== HERO ===== */}
      <header className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.heroEyebrow}>OPEN · EST. 2016 · SEOUL</div>
          <h1 className={styles.heroTitle}>
            <span className={styles.heroTitleGlowKo}>취향의</span>{" "}
            <span className={styles.heroTitleGlowEn}>NCT</span>
          </h1>
          <p className={styles.heroSub}>
            NCT 10th Anniversary · Pick your playlist
          </p>
          <div className={styles.heroNeon} />
        </div>
      </header>

      {/* ===== MAIN LAYOUT ===== */}
      <div className={styles.layout}>
        <main className={styles.shelves}>
          <section>
            {SHELF_CONFIG.map((config, i) => (
              <CDShelf
                key={config.label}
                config={config}
                onTrackSelect={handleTrackSelect}
                animDelay={i * 100}
              />
            ))}
          </section>
          <LibraryShelf />
        </main>

        <aside className={styles.sidebar}>
          <TemplatePanel
            selections={selections}
            onComplete={handleComplete}
            onRemove={handleRemove}
          />
        </aside>
      </div>

      {/* ===== MOOD PICKER ===== */}
      {pendingTrack && (
        <MoodPicker
          pendingTrack={pendingTrack}
          selections={selections}
          onSelect={handleMoodSelect}
          onCancel={handleMoodCancel}
        />
      )}

      {/* ===== SUBMIT MODAL ===== */}
      {showSubmitModal && (
        <div
          className={styles.modalBackdrop}
          onClick={() => submitState !== "loading" && setShowSubmitModal(false)}
        >
          <div
            className={styles.submitModal}
            onClick={(e) => e.stopPropagation()}
          >
            {submitState === "success" ? (
              <div className={styles.successScreen}>
                <div className={styles.successEmoji}>🎉</div>
                <div className={styles.successTitle}>
                  Your CD playlist has been saved!
                </div>
                <div className={styles.successSub}>
                  Check it out in The Community Shelf below.
                </div>
                <button className={styles.resetBtn} onClick={handleReset}>
                  Start Over
                </button>
              </div>
            ) : (
              <>
                <h2 className={styles.submitTitle}>
                  What's your CD playlist name?
                </h2>
                <p className={styles.submitSub}>
                  This will appear on the community shelf.
                </p>
                <form onSubmit={handleSubmit} className={styles.submitForm}>
                  <input
                    className={styles.submitInput}
                    type="text"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value.slice(0, 20))}
                    placeholder="e.g. neo_charms"
                    maxLength={20}
                    autoFocus
                    disabled={submitState === "loading"}
                  />
                  {submitError && (
                    <div className={styles.submitError}>{submitError}</div>
                  )}
                  <div className={styles.submitActions}>
                    <button
                      type="button"
                      className={styles.cancelBtn}
                      onClick={() => setShowSubmitModal(false)}
                      disabled={submitState === "loading"}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className={styles.submitBtn}
                      disabled={submitState === "loading"}
                    >
                      {submitState === "loading" ? "Saving…" : "Submit"}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
