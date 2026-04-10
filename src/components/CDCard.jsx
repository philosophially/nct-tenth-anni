import { useState } from 'react'
import { createPortal } from 'react-dom'
import styles from './CDCard.module.css'

export default function CDCard({ id, group, year, type, albumTitle, albumCover, tracks, onTrackSelect }) {
  const [expanded, setExpanded] = useState(false)
  const [flipped, setFlipped] = useState(false)

  function handleCardClick() {
    setExpanded(true)
    setFlipped(false)
  }

  function handleClose(e) {
    e.stopPropagation()
    setExpanded(false)
    setFlipped(false)
  }

  function handleBackdropClick() {
    setExpanded(false)
    setFlipped(false)
  }

  function handleTrackClick(track, e) {
    e.stopPropagation()
    if (onTrackSelect) {
      onTrackSelect({ track, albumTitle, albumCover, group })
    }
  }

  return (
    <>
      <div className={styles.wrapper}>
        <div className={styles.card} onClick={handleCardClick} title={albumTitle}>
          <img src={albumCover} alt={albumTitle} loading="lazy" />
        </div>
        <span className={styles.title}>{albumTitle}</span>
      </div>

      {expanded &&
        createPortal(
          <div className={styles.expandedOverlay} onClick={handleBackdropClick}>
            <div className={styles.expandedInner} onClick={(e) => e.stopPropagation()}>
              <button className={styles.closeBtn} onClick={handleClose} aria-label="Close">✕</button>

              <div className={`${styles.cardModal} ${flipped ? styles.cardModalBackOpen : ''}`}>

                {/* FRONT — visible when not flipped; hidden via display:none to collapse height */}
                <div
                  className={styles.faceFront}
                  style={{ display: flipped ? 'none' : 'flex' }}
                  onClick={() => setFlipped(true)}
                >
                  <img src={albumCover} alt={albumTitle} />
                  <div className={styles.frontInfo}>
                    <div className={styles.frontTitle}>{albumTitle}</div>
                    <div className={styles.frontGroup}>{year} · {type}</div>
                    <div className={styles.frontHint}>Click to see tracks →</div>
                  </div>
                </div>

                {/* BACK — visible when flipped */}
                <div
                  className={styles.faceBack}
                  style={{ display: flipped ? 'flex' : 'none' }}
                >
                  <div className={styles.backAlbumTitle}>{albumTitle}</div>
                  <div className={styles.backTrackScroll}>
                    <ol className={styles.trackList}>
                      {tracks.map((track, i) => (
                        <li
                          key={i}
                          className={styles.trackItem}
                          onClick={(e) => handleTrackClick(track, e)}
                        >
                          <span className={styles.trackNum}>{i + 1}</span>
                          <span className={styles.trackName}>{track}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                  <div style={{ flexShrink: 0, padding: '12px 16px' }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setFlipped(false)
                      }}
                      style={{
                        display: 'block',
                        padding: '8px 20px',
                        backgroundColor: '#C8E94B',
                        color: '#0f0f0f',
                        border: 'none',
                        borderRadius: '4px',
                        fontFamily: 'DM Sans, sans-serif',
                        fontWeight: '700',
                        fontSize: '13px',
                        cursor: 'pointer',
                      }}
                    >
                      ← Back to cover
                    </button>
                  </div>
                </div>

              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  )
}
