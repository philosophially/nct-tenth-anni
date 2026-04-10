import { createPortal } from 'react-dom'
import styles from './MoodPicker.module.css'
import { MOODS } from '../data/albums'

// pendingTrack: { track, albumTitle, albumCover, group }
// selections: { [moodKey]: { track, albumTitle, albumCover } }
export default function MoodPicker({ pendingTrack, selections, onSelect, onCancel }) {
  const gridMoods = MOODS.slice(0, 9)
  const favMood = MOODS[9]

  function handleSlotClick(mood) {
    if (selections[mood.key]) return // already taken
    onSelect(mood.key, pendingTrack)
  }

  return createPortal(
    <div className={styles.backdrop} onClick={onCancel}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div className={styles.headerTrack}>"{pendingTrack.track}"</div>
          <div className={styles.headerSub}>{pendingTrack.albumTitle} · {pendingTrack.group}</div>
        </div>
        <div className={styles.prompt}>Choose a mood slot for this track:</div>

        <div className={styles.grid}>
          {gridMoods.map((mood) => {
            const taken = !!selections[mood.key]
            return (
              <button
                key={mood.key}
                className={`${styles.slot} ${taken ? styles.taken : ''}`}
                onClick={() => handleSlotClick(mood)}
                aria-label={`${mood.korean} – ${mood.english}`}
              >
                <span className={styles.slotKorean}>{mood.korean}</span>
                <span className={styles.slotEnglish}>{mood.english}</span>
                {taken && <span className={styles.checkmark}>✓</span>}
              </button>
            )
          })}
        </div>

        <div className={styles.favRow}>
          {(() => {
            const taken = !!selections[favMood.key]
            return (
              <button
                className={`${styles.slot} ${taken ? styles.taken : ''}`}
                onClick={() => handleSlotClick(favMood)}
                aria-label="My Favorite"
              >
                <span className={styles.slotFav}>⭐ My Favorite</span>
                {taken && <span className={styles.checkmark}>✓</span>}
              </button>
            )
          })()}
        </div>

        <button className={styles.cancelBtn} onClick={onCancel}>Cancel</button>
      </div>
    </div>,
    document.body
  )
}
