import { useState, useRef, useEffect } from 'react'
import styles from './ChatWidget.module.css'

const API_URL = 'http://localhost:8000/avatar-query'
const AVATAR_IMAGE = 'https://res.cloudinary.com/ddzccqbm2/image/upload/v1782126295/renana_crop_bbosep.png'
const GREETING = "Hi! I'm Renana's AI avatar. Ask me anything about her background, skills, or experience!"

export default function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [responseText, setResponseText] = useState(GREETING)
  const [videoUrl, setVideoUrl] = useState(null)
  const [showVideo, setShowVideo] = useState(false)
  const videoRef = useRef(null)

  useEffect(() => {
    const openHandler = () => setOpen(true)
    window.addEventListener('open-avatar-chat', openHandler)
    return () => window.removeEventListener('open-avatar-chat', openHandler)
  }, [])

  const ask = async (question) => {
    const text = question.trim()
    if (!text || loading) return
    setInput('')
    setLoading(true)
    setShowVideo(false)

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query_text: text, language: 'English' }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Error')

      setResponseText(data.response)
      setVideoUrl(data.video_url)

      // Give the video element a moment to mount/load before swapping it in.
      setTimeout(() => {
        setShowVideo(true)
        setTimeout(() => {
          videoRef.current?.play().catch(() => {
            // Autoplay blocked - the video stays paused, user can press play via controls.
          })
        }, 100)
      }, 400)
    } catch {
      setResponseText("Sorry, I'm having trouble connecting right now. Please try again!")
    } finally {
      setLoading(false)
    }
  }

  const send = () => ask(input)
  const askWhoAmI = () => ask('Who are you?')

  if (!open) {
    return (
      <button className={styles.reopenBtn} onClick={() => setOpen(true)} aria-label="Open chat">
        <img src={AVATAR_IMAGE} alt="" className={styles.reopenImg} />
      </button>
    )
  }

  return (
    <div className={styles.overlay} onClick={() => setOpen(false)}>
      <div className={styles.widget} onClick={e => e.stopPropagation()}>
        <div className={styles.topRow}>
          <span className={styles.langBadge}>🌐 English</span>
          <button className={styles.minimizeBtn} onClick={() => setOpen(false)} aria-label="Close">✕</button>
        </div>

        <div className={styles.circleWrap}>
          <img
            src={AVATAR_IMAGE}
            alt="Renana Friedman"
            className={`${styles.circleMedia} ${showVideo ? styles.hidden : ''}`}
          />
          {videoUrl && (
            <video
              ref={videoRef}
              src={videoUrl}
              playsInline
              controls={showVideo}
              className={`${styles.circleMedia} ${showVideo ? '' : styles.hidden}`}
              onEnded={() => setShowVideo(false)}
            />
          )}
          {loading && <div className={styles.loadingRing} />}
        </div>

        <div className={styles.responseBox}>
          <p>{responseText}</p>
        </div>

        <div className={styles.quickRow}>
          <button className={styles.quickBtn} onClick={askWhoAmI} disabled={loading}>
            💬 Who am I?
          </button>
        </div>

        <div className={styles.inputRow}>
          <input
            className={styles.input}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && send()}
            placeholder="Type your question..."
            disabled={loading}
          />
          <button className={styles.sendBtn} onClick={send} disabled={loading || !input.trim()} aria-label="Send">
            ➤
          </button>
        </div>
      </div>
    </div>
  )
}
