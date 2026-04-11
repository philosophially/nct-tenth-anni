import { useRef, useEffect, useState } from 'react'
import CDCard from './CDCard'
import styles from './CDShelf.module.css'
import { albums } from '../data/albums'

export default function CDShelf({ config, onTrackSelect, animDelay = 0 }) {
  const { label, groups, dividers } = config
  const shelfRef = useRef(null)
  const [visible, setVisible] = useState(false)

  // Scroll-entrance animation via IntersectionObserver
  useEffect(() => {
    const el = shelfRef.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          obs.disconnect()
        }
      },
      { threshold: 0.08 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  const albumsByGroup = groups.map((g) =>
    albums.filter((a) => a.group === g)
  )

  return (
    <div
      ref={shelfRef}
      className={styles.shelf}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(20px)',
        transition: `opacity 0.5s ease ${animDelay}ms, transform 0.5s ease ${animDelay}ms`,
      }}
    >
      {/* Store signage label */}
      <div className={styles.shelfLabel}>
        <div className={styles.shelfLabelAccent} />
        <span className={styles.shelfLabelText}>{label}</span>
      </div>

      {/* Horizontal scroller wraps the plank for clean overflow-x */}
      <div className={styles.plankScroller}>
        <div className={styles.plankWrapper}>
          <div className={styles.cdRow}>
            {albumsByGroup.map((groupAlbums, gi) => (
              <div
                key={groups[gi]}
                className={styles.cardTrack}
                style={{ display: 'flex', alignItems: 'flex-end' }}
              >
                {dividers && gi > 0 && (
                  <>
                    <div className={styles.divider} />
                    <span className={styles.dividerLabel}>{groups[gi]}</span>
                  </>
                )}
                {groupAlbums.map((album) => (
                  <CDCard
                    key={album.id}
                    {...album}
                    onTrackSelect={onTrackSelect}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className={styles.shelfPlank} />
    </div>
  )
}
