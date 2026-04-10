import { useState } from "react";
import styles from "./TemplatePanel.module.css";
import { MOODS } from "../data/albums";

// selections: { [moodKey]: { track, albumTitle, albumCover } }
export default function TemplatePanel({ selections, onComplete, onRemove }) {
  const [confirmingSlot, setConfirmingSlot] = useState(null);

  const filled = Object.keys(selections).length;
  const total = 10;
  const allDone = filled === total;

  const gridMoods = MOODS.slice(0, 9);
  const favMood = MOODS[9];

  function handleSlotClick(moodKey) {
    if (!selections[moodKey]) return; // empty slot — do nothing
    setConfirmingSlot(moodKey);
  }

  function handleRemove(moodKey) {
    onRemove(moodKey);
    setConfirmingSlot(null);
  }

  function renderSlot(mood) {
    const sel = selections[mood.key];
    const isFav = mood.key === "favorite";
    const isConfirming = confirmingSlot === mood.key;

    return (
      <div
        key={mood.key}
        className={`${styles.slot} ${sel ? styles.filled : ""} ${isConfirming ? styles.confirming : ""}`}
        onClick={() => handleSlotClick(mood.key)}
        title={sel ? "Click to remove" : undefined}
      >
        <div className={styles.slotInner}>
          {sel ? (
            <img
              className={styles.slotThumb}
              src={sel.albumCover}
              alt={sel.albumTitle}
            />
          ) : (
            <div className={styles.slotThumbPlaceholder} />
          )}
          <div className={styles.slotInfo}>
            {isFav ? (
              <span className={styles.slotHashtag}>⭐ My Fave</span>
            ) : (
              <>
                <span className={styles.slotHashtag}>{mood.korean}</span>
                <span className={styles.slotEnglish}>{mood.english}</span>
              </>
            )}
            {sel && <span className={styles.slotSong}>{sel.track}</span>}
          </div>

          {/* Inline remove confirmation — shown over filled slot */}
          {isConfirming && (
            <div
              className={styles.confirmOverlay}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className={styles.confirmRemoveBtn}
                onClick={() => handleRemove(mood.key)}
              >
                Remove
              </button>
              <button
                className={styles.confirmKeepBtn}
                onClick={() => setConfirmingSlot(null)}
              >
                Keep
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.panel}>
      <div className={styles.panelTitle}>나의 취향의 NCT</div>
      <div className={styles.titleBar} />

      <div className={styles.progressRow}>
        <span className={styles.progress}>
          {filled} / {total}
        </span>
      </div>
      <div className={styles.progressBar}>
        <div
          className={styles.progressFill}
          style={{ width: `${(filled / total) * 100}%` }}
        />
      </div>

      <div className={styles.grid}>{gridMoods.map(renderSlot)}</div>
      <div className={styles.favRow}>{renderSlot(favMood)}</div>

      {allDone && (
        <button className={styles.completeBtn} onClick={onComplete}>
          Complete! 🎉
        </button>
      )}
    </div>
  );
}
