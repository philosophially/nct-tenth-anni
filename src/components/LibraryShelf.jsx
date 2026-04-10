import { useState } from 'react'
import styles from './LibraryShelf.module.css'
import { MOODS } from '../data/albums'

const SPINE_COLOURS = [
  '#1a1a2e',
  '#16213e',
  '#2d1b33',
  '#1a2a1a',
  '#2a1a1a',
  '#1a2a2a',
  '#2a2a1a',
  '#1e1a2a',
  '#2a1e1a',
  '#0f1a2a',
  '#1a0f1a',
  '#2a1a0f',
]

const SPINE_FONTS = [
  'Bebas Neue',
  'Oswald',
  'Rajdhani',
  'Barlow Condensed',
  'IBM Plex Mono',
  'Playfair Display',
  'Anton',
]

function spineColourForEntry(entry) {
  const idStr = String(entry.id)
  const code = idStr.charCodeAt(0) || 0
  return SPINE_COLOURS[code % SPINE_COLOURS.length]
}

function spineFontForEntry(entry) {
  const idStr = String(entry.id)
  const code = idStr.length > 1 ? idStr.charCodeAt(1) : idStr.charCodeAt(0)
  return SPINE_FONTS[code % SPINE_FONTS.length]
}

const MOOD_KEYS = MOODS.map((m) => m.key)
const gridMoods = MOODS.slice(0, 9)
const favMood = MOODS[9]

function buildSelectionsFromRow(row) {
  // row columns: mood_청량, album_cover_청량, etc.
  const sel = {}
  MOOD_KEYS.forEach((key) => {
    const colKey = key === 'favorite' ? 'mood_favorite' : `mood_${key}`
    const coverKey = key === 'favorite' ? 'album_cover_favorite' : `album_cover_${key}`
    if (row[colKey]) {
      sel[key] = {
        track: row[colKey],
        albumCover: row[coverKey] || '',
        albumTitle: '',
      }
    }
  })
  return sel
}

function EntryModal({ entry, onClose }) {
  const selections = buildSelectionsFromRow(entry)

  function renderSlot(mood) {
    const sel = selections[mood.key]
    const isFav = mood.key === 'favorite'
    return (
      <div key={mood.key} className={styles.previewSlot}>
        {sel ? (
          <img className={styles.previewThumb} src={sel.albumCover} alt={sel.track} />
        ) : (
          <div className={styles.previewThumbEmpty} />
        )}
        <div className={styles.previewInfo}>
          {isFav ? (
            <span className={styles.previewHashtag}>⭐ My Fav</span>
          ) : (
            <>
              <span className={styles.previewHashtag}>{mood.korean}</span>
              <span className={styles.previewEnglish}>{mood.english}</span>
            </>
          )}
          {sel && <span className={styles.previewSong}>{sel.track}</span>}
        </div>
      </div>
    )
  }

  return (
    <div className={styles.modalBackdrop} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.modalClose} onClick={onClose} aria-label="Close">✕</button>
        <div className={styles.modalNick}>{entry.nickname}</div>
        <div className={styles.modalDate}>
          {new Date(entry.created_at).toLocaleDateString('ko-KR', {
            year: 'numeric', month: 'long', day: 'numeric',
          })}
        </div>
        <div className={styles.previewGrid}>
          {gridMoods.map(renderSlot)}
        </div>
        <div className={styles.previewFavRow}>
          {renderSlot(favMood)}
        </div>
      </div>
    </div>
  )
}

export default function LibraryShelf({ entries }) {
  const [active, setActive] = useState(null)

  return (
    <section className={styles.section} id="community">
      <div className={styles.sectionTitle}>The Community Shelf</div>
      <div className={styles.shelfWrapper}>
        <div className={styles.spineRow}>
          {entries.length === 0 && (
            <div className={styles.empty}>No entries yet — be the first!</div>
          )}
          {entries.map((entry) => (
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
                style={{ fontFamily: `'${spineFontForEntry(entry)}', sans-serif` }}
              >
                {entry.nickname}
              </span>
            </button>
          ))}
        </div>
      </div>
      <div className={styles.shadow} />

      {active && <EntryModal entry={active} onClose={() => setActive(null)} />}
    </section>
  )
}
