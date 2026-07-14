import { useState, useRef, useEffect, useCallback } from 'react'
import styles from './ChatWidget.module.css'

const API_BASE = 'https://rag-production-a22f.up.railway.app'
//const API_BASE = 'http://localhost:8000'
const AVATAR_IMAGE = 'https://res.cloudinary.com/ddzccqbm2/image/upload/v1782126295/renana_crop_bbosep.png'
const GREETING = "Hi! I'm Renana's AI portfolio assistant. I can tell you about her background as a backend developer, the systems and projects she's built, and her technical skills. Feel free to ask me anything!"

const INACTIVITY_CLOSE_MS = 3 * 60 * 1000

export default function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [greetingPlaying, setGreetingPlaying] = useState(false)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [connecting, setConnecting] = useState(false)
  const [streamReady, setStreamReady] = useState(false)
  const [responseText, setResponseText] = useState(GREETING)

  const videoRef = useRef(null)
  const greetingVideoRef = useRef(null)
  const pcRef = useRef(null)               // RTCPeerConnection
  const streamInfoRef = useRef(null)       // { streamId, sessionId }
  const inactivityTimerRef = useRef(null)
  const isConnectingRef = useRef(false)

  // ---------------------------------------------------------------------
  // Open/close connection
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
        // It's okay if close fails - D-ID automatically closes inactive streams
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
      // Not critical if greeting fails - the next query will still work
    }
  }, [])

  const connectStream = useCallback(async () => {
    if (pcRef.current || isConnectingRef.current) return // Already connected/connecting
    isConnectingRef.current = true
    setConnecting(true)

    try {
      // Step 1: Open stream in backend, receive SDP offer + ICE servers
      const startRes = await fetch(`${API_BASE}/stream/start`, { method: 'POST' })
      const startData = await startRes.json()
      if (!startRes.ok) throw new Error(startData.detail || 'Failed to start stream')

      const { stream_id: streamId, session_id: sessionId, offer, ice_servers: iceServers } = startData
      streamInfoRef.current = { streamId, sessionId }

      // Step 2: Create RTCPeerConnection with the received ICE servers
      const pc = new RTCPeerConnection({ iceServers })
      pcRef.current = pc

      // Connect the incoming track from D-ID to the <video> element.
      // Connect the incoming video, but only switch from image to video when a frame
      // is actually playing. This avoids the black screen flash that occurs when WebRTC
      // technically connects but hasn't started rendering content.
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

      // Send any discovered local ICE candidate to D-ID via the backend
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
          // We no longer send a warm-up / sendToStream(GREETING) to save D-ID credits.
          // Instead, the local greeting video plays. WebRTC connects silently in the background
          // and only starts streaming live video when the user submits their first question.
          setConnecting(false)
        }
        if (['failed', 'disconnected', 'closed'].includes(pc.connectionState)) {
          setStreamReady(false)
          setConnecting(false)
        }
      }

      // Step 3: Receive offer from D-ID, create answer, and send it back
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

  const handleOpen = useCallback(() => {
    setOpen(true)
    setGreetingPlaying(true)
  }, [])

  // Open connection when chat opens, close when component unmounts
  useEffect(() => {
    window.addEventListener('open-avatar-chat', handleOpen)
    return () => window.removeEventListener('open-avatar-chat', handleOpen)
  }, [handleOpen])

  useEffect(() => {
    if (open) connectStream()
  }, [open, connectStream])

  // Note: We deliberately do not close the stream on unmount here.
  // In React StrictMode (development), this would immediately close a newly initialized stream before it connects.
  // Closure is handled via: (1) Clicking the close button, (2) Inactivity timeout, (3) D-ID automatically closes orphaned streams.

  // ---------------------------------------------------------------------
  // Send query
  // ---------------------------------------------------------------------

  const ask = async (question) => {
    const text = question.trim()
    if (!text || loading) return

    // If the user submits a question while the greeting video is still playing, pause it and transition to the live response
    if (greetingPlaying) {
      if (greetingVideoRef.current) {
        greetingVideoRef.current.pause()
        greetingVideoRef.current.currentTime = 0
      }
      setGreetingPlaying(false)
    }

    // Reconnect if the stream connection was closed (e.g., due to inactivity)
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

      // Display response text immediately; video stream starts playing almost instantly
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
    if (greetingVideoRef.current) {
      greetingVideoRef.current.pause()
      greetingVideoRef.current.currentTime = 0
    }
    setGreetingPlaying(false)
    setOpen(false)
    closeStream()
  }

  const handleGreetingEnded = () => {
    setGreetingPlaying(false)
  }

  if (!open) {
    return (
      <button className={styles.reopenBtn} onClick={handleOpen} aria-label="Open chat">
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
          {/* Static avatar image - shown only when no video is active (neither local greeting nor live WebRTC stream) */}
          <img
            src={AVATAR_IMAGE}
            alt="Renana Friedman"
            className={`${styles.circleMedia} ${(!greetingPlaying && !streamReady) ? '' : styles.hidden}`}
          />
          
          {/* 1. Local greeting video */}
          <video
            ref={greetingVideoRef}
            src="/greeting.mp4"
            playsInline
            autoPlay
            className={`${styles.circleMedia} ${greetingPlaying ? '' : styles.hidden}`}
            onEnded={handleGreetingEnded}
          />

          {/* 2. Live WebRTC video stream from D-ID */}
          <video
            ref={videoRef}
            playsInline
            autoPlay
            muted={false}
            className={`${styles.circleMedia} ${styles.avatarVideo} ${(!greetingPlaying && streamReady) ? '' : styles.hidden}`}
          />
          {/* Spinner shown during WebRTC connection or LLM processing. Hidden while the local greeting video is playing */}
          {!greetingPlaying && (connecting || loading) && <div className={styles.loadingRing} />}
        </div>

        {/* Status overlay */}
        {!greetingPlaying && connecting && (
          <p className={styles.statusText}>Connecting...</p>
        )}
        {!greetingPlaying && !connecting && loading && (
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
