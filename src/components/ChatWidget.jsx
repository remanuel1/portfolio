import { useState, useRef, useEffect, useCallback } from 'react'
import styles from './ChatWidget.module.css'

//const API_BASE = 'https://rag-production-a22f.up.railway.app'
const AVATAR_IMAGE = 'https://res.cloudinary.com/ddzccqbm2/image/upload/v1782126295/renana_crop_bbosep.png'
const GREETING = "Hi! I'm Renana's AI portfolio assistant. I can tell you about her background as a backend developer, the systems and projects she's built, and her technical skills. Feel free to ask me anything!"

// כמה זמן לחכות בלי שאלה חדשה לפני שסוגרים את ה-stream לבד (חוסך דקות)
const INACTIVITY_CLOSE_MS = 3 * 60 * 1000

export default function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)          // מחכים לתשובת ה-LLM
  const [connecting, setConnecting] = useState(false)     // מקימים את חיבור ה-WebRTC
  const [streamReady, setStreamReady] = useState(false)   // החיבור פתוח ומוכן
  const [responseText, setResponseText] = useState(GREETING)

  const videoRef = useRef(null)
  const pcRef = useRef(null)               // RTCPeerConnection
  const streamInfoRef = useRef(null)       // { streamId, sessionId }
  const inactivityTimerRef = useRef(null)
  const isConnectingRef = useRef(false)    // הגנה סינכרונית מפני קריאה כפולה (React StrictMode)

  // ---------------------------------------------------------------------
  // פתיחת/סגירת החיבור
  // ---------------------------------------------------------------------

  const closeStream = useCallback(async () => {
    if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current)

    const info = streamInfoRef.current
    streamInfoRef.current = null
    isConnectingRef.current = false
    setStreamReady(false)

    if (pcRef.current) {
      pcRef.current.close()
      pcRef.current = null
    }

    if (info) {
      try {
        await fetch(`${API_BASE}/stream/close`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ stream_id: info.streamId, session_id: info.sessionId }),
        })
      } catch {
        // לא נורא אם הסגירה נכשלת - D-ID סוגר stream-ים לא פעילים לבד
      }
    }
  }, [])

  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current)
    inactivityTimerRef.current = setTimeout(() => {
      closeStream()
    }, INACTIVITY_CLOSE_MS)
  }, [closeStream])

  const sendToStream = useCallback(async (text) => {
    const info = streamInfoRef.current
    if (!info) return
    try {
      await fetch(`${API_BASE}/stream/speak`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stream_id: info.streamId, session_id: info.sessionId, text, language: 'English' }),
      })
    } catch {
      // לא קריטי אם הברכה נכשלת - השאלה הבאה עדיין תעבוד
    }
  }, [])

  const connectStream = useCallback(async () => {
    if (pcRef.current || isConnectingRef.current) return // כבר מחובר/מתחבר
    isConnectingRef.current = true
    setConnecting(true)

    try {
      // שלב 1: פותחים stream בבאקאנד, מקבלים offer + ice servers
      const startRes = await fetch(`${API_BASE}/stream/start`, { method: 'POST' })
      const startData = await startRes.json()
      if (!startRes.ok) throw new Error(startData.detail || 'Failed to start stream')

      const { stream_id: streamId, session_id: sessionId, offer, ice_servers: iceServers } = startData
      streamInfoRef.current = { streamId, sessionId }

      // שלב 2: יוצרים RTCPeerConnection עם שרתי ה-ICE שקיבלנו
      const pc = new RTCPeerConnection({ iceServers })
      pcRef.current = pc

      // כשמגיע track של וידאו/אודיו מ-D-ID, מחברים אותו ל-<video>
      // מחברים את הוידאו הנכנס ל-<video>, אבל מחליפים מהתמונה לוידאו רק
      // כשיש בפועל פריים שמתנגן (playing) - לא ברגע שה-WebRTC "מחובר" טכנית,
      // כי באותו רגע עדיין אין תוכן אמיתי (זה מה שגרם למסך השחור והקפיצה)
      pc.ontrack = (event) => {
        if (videoRef.current && event.streams[0]) {
          videoRef.current.srcObject = event.streams[0]
          videoRef.current.play().catch(() => {})
          videoRef.current.onplaying = () => {
            setStreamReady(true)
            setConnecting(false)
          }
        }
      }

      // כל ICE candidate שהדפדפן מגלה - שולחים ל-D-ID דרך הבאקאנד
      pc.onicecandidate = (event) => {
        const candidate = event.candidate
        fetch(`${API_BASE}/stream/ice`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            stream_id: streamId,
            session_id: sessionId,
            candidate: candidate ? candidate.candidate : null,
            sdpMid: candidate ? candidate.sdpMid : null,
            sdpMLineIndex: candidate ? candidate.sdpMLineIndex : null,
          }),
        }).catch(() => {})
      }

      pc.onconnectionstatechange = () => {
        if (pc.connectionState === 'connected') {
          // "מחממים" את הוידאו מיד עם ברכה - בלי זה, D-ID לא שולח שום פריים.
          // התמונה נשארת מוצגת (עם ספינר "Connecting...") עד שהוידאו
          // *בפועל* מתחיל להתנגן - זה קורה ב-ontrack.onplaying, לא כאן.
          sendToStream(GREETING)
        }
        if (['failed', 'disconnected', 'closed'].includes(pc.connectionState)) {
          setStreamReady(false)
          setConnecting(false)
        }
      }

      // שלב 3: מקבלים את ה-offer מ-D-ID, יוצרים answer, ושולחים אותו בחזרה
      await pc.setRemoteDescription(new RTCSessionDescription(offer))
      const answer = await pc.createAnswer()
      await pc.setLocalDescription(answer)

      await fetch(`${API_BASE}/stream/sdp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stream_id: streamId, session_id: sessionId, answer }),
      })

      resetInactivityTimer()
    } catch (err) {
      console.error('Stream connection failed:', err)
      setConnecting(false)
      isConnectingRef.current = false
      streamInfoRef.current = null
    }
  }, [resetInactivityTimer, sendToStream])

  // פותחים את החיבור כשהצ'אט נפתח, סוגרים כשהקומפוננטה מתפרקת
  useEffect(() => {
    const openHandler = () => setOpen(true)
    window.addEventListener('open-avatar-chat', openHandler)
    return () => window.removeEventListener('open-avatar-chat', openHandler)
  }, [])

  useEffect(() => {
    if (open) connectStream()
  }, [open, connectStream])

  // הערה: בכוונה אין כאן useEffect שסוגר את ה-stream ב-unmount.
  // ב-React StrictMode (dev) זה היה גורם לסגירה מיידית של stream טרי לפני שהתחבר.
  // הסגירה מתבצעת: (1) בלחיצה על X, (2) אחרי חוסר פעילות, (3) D-ID סוגר stream יתום לבד ממילא.

  // ---------------------------------------------------------------------
  // שליחת שאלה
  // ---------------------------------------------------------------------

  const ask = async (question) => {
    const text = question.trim()
    if (!text || loading) return

    // אם החיבור נסגר (לדוגמה מחוסר פעילות) - פותחים חיבור חדש קודם
    if (!streamInfoRef.current) {
      await connectStream()
    }
    if (!streamInfoRef.current) {
      setResponseText("Sorry, I'm having trouble connecting right now. Please try again!")
      return
    }

    setInput('')
    setLoading(true)
    resetInactivityTimer()

    try {
      const { streamId, sessionId } = streamInfoRef.current
      const res = await fetch(`${API_BASE}/stream/send-text`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stream_id: streamId,
          session_id: sessionId,
          query_text: text,
          language: 'English',
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Error')

      // הטקסט מוצג מיד; הוידאו כבר מתחיל "לדבר" דרך ה-stream הפתוח כמעט מיידית
      setResponseText(data.response)
    } catch {
      setResponseText("Sorry, I'm having trouble connecting right now. Please try again!")
    } finally {
      setLoading(false)
    }
  }

  const send = () => ask(input)
  const askWhoAmI = () => ask('Who are you?')

  const handleClose = () => {
    setOpen(false)
    closeStream()
  }

  if (!open) {
    return (
      <button className={styles.reopenBtn} onClick={() => setOpen(true)} aria-label="Open chat">
        <img src={AVATAR_IMAGE} alt="" className={styles.reopenImg} />
      </button>
    )
  }

  return (
    <div className={styles.overlay} onClick={handleClose}>
      <div className={styles.widget} onClick={e => e.stopPropagation()}>
        <div className={styles.topRow}>
          <span className={styles.langBadge}>🌐 English</span>
          <button className={styles.minimizeBtn} onClick={handleClose} aria-label="Close">✕</button>
        </div>

        <div className={styles.circleWrap}>
          <img
            src={AVATAR_IMAGE}
            alt="Renana Friedman"
            className={`${styles.circleMedia} ${streamReady ? styles.hidden : ''}`}
          />
          {/* הוידאו תמיד קיים ב-DOM (לא src="", אלא srcObject שמוזן דרך ה-ref) */}
          <video
            ref={videoRef}
            playsInline
            autoPlay
            muted={false}
            className={`${styles.circleMedia} ${styles.avatarVideo} ${streamReady ? '' : styles.hidden}`}
          />
          {/* ספינר בזמן חיבור ה-WebRTC או המתנה ל-LLM */}
          {(connecting || loading) && <div className={styles.loadingRing} />}
        </div>

        {/* סטטוס */}
        {connecting && (
          <p className={styles.statusText}>Connecting...</p>
        )}
        {!connecting && loading && (
          <p className={styles.statusText}>Thinking...</p>
        )}

        <div className={styles.responseBox}>
          <p>{responseText}</p>
        </div>

        <div className={styles.quickRow}>
          <button className={styles.quickBtn} onClick={askWhoAmI} disabled={loading || connecting}>
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
