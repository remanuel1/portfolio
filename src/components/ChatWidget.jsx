import { useState, useRef, useEffect } from 'react'
import styles from './ChatWidget.module.css'

const API_BASE = 'https://rag-production-a22f.up.railway.app'
const AVATAR_IMAGE = 'https://res.cloudinary.com/ddzccqbm2/image/upload/v1782126295/renana_crop_bbosep.png'
const GREETING = "Hi! I'm Renana's AI avatar. Ask me anything about her background, skills, or experience!"
const POLL_INTERVAL_MS = 2000
const POLL_TIMEOUT_MS = 120000

export default function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [videoLoading, setVideoLoading] = useState(false)
  const [responseText, setResponseText] = useState(GREETING)
  const [videoUrl, setVideoUrl] = useState(null)
  const [showVideo, setShowVideo] = useState(false)
  const videoRef = useRef(null)
  const pollRef = useRef(null)

  useEffect(() => {
    const openHandler = () => setOpen(true)
    window.addEventListener('open-avatar-chat', openHandler)
    return () => window.removeEventListener('open-avatar-chat', openHandler)
  }, [])

  // ניקוי ה-polling כשהקומפוננטה מתפרקת
  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
    }
  }, [])

  const startPolling = (talkId) => {
    setVideoLoading(true)
    const startTime = Date.now()

    pollRef.current = setInterval(async () => {
      // timeout - עצור polling אחרי POLL_TIMEOUT_MS
      if (Date.now() - startTime > POLL_TIMEOUT_MS) {
        clearInterval(pollRef.current)
        setVideoLoading(false)
        return
      }

      try {
        const res = await fetch(`${API_BASE}/avatar-status/${talkId}`)
        const data = await res.json()

        if (data.status === 'done' && data.video_url) {
          clearInterval(pollRef.current)
          setVideoUrl(data.video_url)
          setVideoLoading(false)

          // המתן קצת לפני שמציגים את הוידאו כדי שיטען
          setTimeout(() => {
            setShowVideo(true)
            setTimeout(() => {
              videoRef.current?.play().catch(() => {
                // autoplay blocked - המשתמש יכול ללחוץ play
              })
            }, 100)
          }, 400)
        }
        // אם status הוא 'created' או 'started' - ממשיכים לפול
      } catch {
        // שגיאה בפולינג - ממשיכים לנסות
      }
    }, POLL_INTERVAL_MS)
  }

  const ask = async (question) => {
    const text = question.trim()
    if (!text || loading) return
    setInput('')
    setLoading(true)
    setShowVideo(false)
    setVideoUrl(null)
    if (pollRef.current) clearInterval(pollRef.current)

    try {
      const res = await fetch(`${API_BASE}/avatar-query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query_text: text, language: 'English' }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Error')

      // מציגים את הטקסט מיד
      setResponseText(data.response)
      setLoading(false)

      // מתחילים polling לוידאו ברקע
      startPolling(data.talk_id)
    } catch {
      setResponseText("Sorry, I'm having trouble connecting right now. Please try again!")
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
          {/* ספינר בזמן יצירת הוידאו */}
          {(loading || videoLoading) && <div className={styles.loadingRing} />}
        </div>

        {/* סטטוס טעינה */}
        {loading && (
          <p className={styles.statusText}>Thinking...</p>
        )}
        {!loading && videoLoading && (
          <p className={styles.statusText}>Generating avatar response...</p>
        )}

        <div className={styles.responseBox}>
          <p>{responseText}</p>
        </div>

        <div className={styles.quickRow}>
          <button className={styles.quickBtn} onClick={askWhoAmI} disabled={loading || videoLoading}>
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
