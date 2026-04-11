import { useEffect, useRef, useState } from "react";
import styles from "./StoreMusic.module.css";

export default function StoreMusic() {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = 0.15;
    audio
      .play()
      .then(() => setIsPlaying(true))
      .catch(() => setIsPlaying(false));
  }, []);

  useEffect(() => {
    const id = setTimeout(() => setVisible(true), 2000);
    return () => clearTimeout(id);
  }, []);

  function togglePlay() {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play();
      setIsPlaying(true);
    }
  }

  return (
    <div
      className={`${styles.wrapper}${visible ? ` ${styles.visible}` : ""}`}
    >
      <audio
        ref={audioRef}
        src="/audio/neo-got-my-back.mp3"
        loop
        preload="auto"
      />
      <button
        className={styles.btn}
        onClick={togglePlay}
        aria-label={isPlaying ? "Pause store music" : "Play store music"}
      >
        <span
          className={`${styles.icon}${!isPlaying ? ` ${styles.paused}` : ""}`}
        >
          ♫
        </span>
        <span className={styles.label}>store music</span>
      </button>
    </div>
  );
}
