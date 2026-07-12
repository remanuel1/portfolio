import { useEffect, useRef, useState } from 'react'
import styles from './ChatWidget.module.css'

export default function AvatarVideo({ videoUrl }) {
  const videoRef = useRef(null)
  const [needsPlayButton, setNeedsPlayButton] = useState(false)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    if (!videoUrl) return
    setHasError(false)
    setNeedsPlayButton(false)

    const video = videoRef.current
    if (!video) return

    video.load()

    // Small delay lets the browser buffer the first frames before playing,
    // so the video doesn't start on a black/empty frame.
    const timer = setTimeout(() => {
      video.play().catch(() => {
        // Autoplay was blocked by the browser - show a manual play button instead.
        setNeedsPlayButton(true)
      })
    }, 500)

    return () => clearTimeout(timer)
  }, [videoUrl])

  if (!videoUrl) return null

  if (hasError) {
    return (
      <div className={styles.videoError}>
        Couldn't load the avatar video.
      </div>
    )
  }

  return (
    <div className={styles.videoCard}>
      <video
        ref={videoRef}
        src={videoUrl}
        playsInline
        controls
        onError={() => setHasError(true)}
        className={styles.videoEl}
      />
      {needsPlayButton && (
        <button
          className={styles.playOverlay}
          onClick={() => {
            videoRef.current?.play()
            setNeedsPlayButton(false)
          }}
          aria-label="Play avatar response"
        >
          ▶
        </button>
      )}
    </div>
  )
}
